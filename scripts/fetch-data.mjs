// Pobiera dane i zdjęcia z obecnego sklepu gymcompression.pl (WooCommerce Store API + strony HTML)
// i zapisuje je do src/data/*.json oraz public/img/p/*.webp.
// Uruchom: node scripts/fetch-data.mjs   (wymaga dostępu sieciowego do gymcompression.pl)
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'node-html-parser';
import { fetchPosts } from './fetch-posts.mjs';

const ORIGIN = 'https://gymcompression.pl';
const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DATA = path.join(ROOT, 'src/data');
const IMG = path.join(ROOT, 'public/img/p');
const WIDTHS = [480, 960, 1440];
const UA = { 'user-agent': 'Mozilla/5.0 (prototype build; contact via site owner)' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, as = 'text', tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return as === 'json' ? r.json() : as === 'buf' ? Buffer.from(await r.arrayBuffer()) : r.text();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(800 * 2 ** i);
    }
  }
}

const cdata = (s = '') => s.trim().replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();
const decode = (s = '') => parse(`<div>${s}</div>`).text.replace(/\s+/g, ' ').trim();

// Czyści HTML opisu: usuwa kalkulator rozmiaru, skrypty, style inline, puste elementy.
function cleanHtml(html = '') {
  const root = parse(`<div id="r">${html}</div>`);
  const wrap = root.querySelector('#r');
  root.querySelectorAll('script,style,#size-calculator,input,button,iframe').forEach((n) => n.remove());
  wrap.querySelectorAll('*').forEach((n) => {
    for (const a of Object.keys(n.attributes)) if (!['href'].includes(a)) n.removeAttribute(a);
    if (n.tagName === 'A') {
      const h = n.getAttribute('href') || '';
      if (h.startsWith(ORIGIN)) n.setAttribute('href', h.replace(ORIGIN, ''));
    }
  });
  // h1 w opisie -> h2 (jeden H1 na stronę)
  root.querySelectorAll('h1').forEach((n) => (n.tagName = 'h2'));
  let out = wrap.innerHTML;
  out = out.replace(/<(p|div|span|strong)>\s*(&nbsp;)?\s*<\/\1>/g, '').replace(/\s{2,}/g, ' ');
  return out.trim();
}

function textLines(html) {
  return parse(`<div>${html}</div>`).structuredText.split('\n').map((l) => l.trim()).filter(Boolean);
}

// "W skład kompletu wchodzi 5 elementów:" + lista -> elementy zestawu
function setItems(html) {
  const root = parse(`<div>${html}</div>`);
  const all = root.querySelectorAll('p,h2,h3,h4,ul,ol');
  for (let i = 0; i < all.length; i++) {
    if (/w skład|w konstrukcji produktu/i.test(all[i].text)) {
      const list = all.slice(i + 1).find((n) => n.tagName === 'UL' || n.tagName === 'OL');
      if (list) return list.querySelectorAll('li').map((li) => li.text.replace(/[,.;]\s*$/, '').trim()).filter(Boolean);
    }
  }
  return [];
}

async function imageSet(src) {
  const rel = src.replace(`${ORIGIN}/wp-content/uploads/`, '');
  const base = rel.replace(/\.(webp|jpe?g|png)$/i, '').replace(/[\/]/g, '-');
  const first = path.join(IMG, `${base}-${WIDTHS[0]}.webp`);
  let meta;
  try {
    await fs.access(first);
    meta = await sharp(path.join(IMG, `${base}-${WIDTHS[WIDTHS.length - 1]}.webp`)).metadata();
  } catch {
    const buf = await get(src, 'buf');
    const img = sharp(buf);
    const m = await img.metadata();
    for (const w of WIDTHS) {
      await sharp(buf).resize({ width: Math.min(w, m.width), withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(IMG, `${base}-${w}.webp`));
    }
    meta = { width: Math.min(WIDTHS.at(-1), m.width), height: Math.round(Math.min(WIDTHS.at(-1), m.width) * (m.height / m.width)) };
  }
  return { base, w: meta.width, h: meta.height, original: src };
}

async function main() {
  await fs.mkdir(IMG, { recursive: true });

  // 1. Produkty (Store API)
  let products = [];
  for (let page = 1; page < 10; page++) {
    const batch = await get(`${ORIGIN}/wp-json/wc/store/v1/products?per_page=100&page=${page}`, 'json');
    products = products.concat(batch);
    if (batch.length < 100) break;
  }
  const cats = await get(`${ORIGIN}/wp-json/wc/store/v1/products/categories?per_page=100`, 'json');
  console.log(`produkty: ${products.length}, kategorie: ${cats.length}`);

  // 2. Strony produktów: meta SEO, Specyfikacja, FAQ
  const out = [];
  for (const p of products) {
    const html = await get(p.permalink);
    const doc = parse(html);
    const seoTitle = doc.querySelector('title')?.text.trim() || '';
    const seoDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const spec = doc.querySelector('#tab-specyfikacja');
    const faqEl = doc.querySelector('#tab-faq');
    const faq = [];
    if (faqEl) {
      const nodes = faqEl.querySelectorAll('h2,h3,h4,p,strong');
      let q = null;
      // format 1: <li><strong>Pytanie?</strong> Odpowiedź</li>
      for (const li of faqEl.querySelectorAll('li')) {
        const st = li.querySelector('strong,b');
        const q1 = st?.text.replace(/\s+/g, ' ').trim();
        const a1 = li.text.replace(/\s+/g, ' ').trim().slice((st?.text.replace(/\s+/g, ' ').trim() || '').length).trim();
        if (q1 && q1.endsWith('?') && a1) faq.push({ q: q1, a: a1 });
      }
      // format 2: pytanie i odpowiedź w osobnych akapitach/nagłówkach
      if (!faq.length) for (const n of faqEl.querySelectorAll('h3,h4,p')) {
        const t = n.text.replace(/\s+/g, ' ').trim();
        if (!t || /^faq$/i.test(t)) continue;
        if (t.endsWith('?')) { q = t; continue; }
        if (q) { faq.push({ q, a: t }); q = null; }
      }
    }
    const specLines = spec ? textLines(spec.innerHTML).filter((l) => !/^specyfikacja( techniczna)?$/i.test(l)) : [];
    const images = [];
    for (const im of p.images) {
      try { images.push({ ...(await imageSet(im.src)), alt: decode(im.alt) || decode(p.name) }); }
      catch (e) { console.warn('obraz', im.src, e.message); }
    }
    const sizeAttr = p.attributes.find((a) => /rozmiar/i.test(a.name));
    const descHtml = cleanHtml(p.description);
    const shortText = decode(cleanHtml(p.short_description)).split(' function calculateSize')[0];
    out.push({
      id: p.id,
      name: decode(p.name),
      slug: p.slug,
      sku: p.sku,
      price: Number(p.prices.price) / 10 ** p.prices.currency_minor_unit,
      regularPrice: Number(p.prices.regular_price) / 10 ** p.prices.currency_minor_unit,
      onSale: p.on_sale,
      inStock: p.is_in_stock,
      stockText: decode(p.stock_availability?.text || ''),
      categories: p.categories.map((c) => c.slug),
      sizes: sizeAttr ? sizeAttr.terms.map((t) => t.name) : [],
      short: shortText,
      descHtml,
      setItems: setItems(descHtml),
      spec: specLines,
      faq,
      seoTitle,
      seoDesc,
      oldUrl: p.permalink.replace(ORIGIN, ''),
      images,
    });
    process.stdout.write('.');
  }
  console.log('');

  // 3. Kategorie: opis + meta + stary URL
  const catOut = [];
  for (const c of cats) {
    let seoTitle = '', seoDesc = '';
    try {
      const doc = parse(await get(c.permalink));
      seoTitle = doc.querySelector('title')?.text.trim() || '';
      seoDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    } catch {}
    catOut.push({ id: c.id, slug: c.slug, name: decode(c.name), parent: c.parent, count: c.count, descHtml: cleanHtml(c.description), seoTitle, seoDesc, oldUrl: c.permalink.replace(ORIGIN, '') });
  }

  // 4. Strony informacyjne (tekst do przeniesienia)
  const pages = {};
  for (const slug of ['wysylka-i-dostawa', 'refund_returns', 'kontakt', 'regulamin', 'polityka-prywatnosci', 'polityka-cookies']) {
    try {
      const doc = parse(await get(`${ORIGIN}/${slug}/`));
      const main = doc.querySelector('.entry-content') || doc.querySelector('main');
      pages[slug] = { title: decode(doc.querySelector('h1')?.text || slug), html: cleanHtml(main?.innerHTML || ''), seoDesc: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '' };
    } catch (e) { console.warn('strona', slug, e.message); }
  }

  // 5. Blog: treść, daty, zajawki i zdjęcia wpisów (strony poradnika i mapa przekierowań)
  let posts = [];
  try { posts = await fetchPosts(); } catch (e) { console.warn('blog', e.message); }

  // 6. Logo i wszystkie stare adresy z sitemap
  const home = parse(await get(`${ORIGIN}/`));
  const logoSrc = home.querySelector('.custom-logo, header img')?.getAttribute('src');
  let logo = null;
  if (logoSrc) {
    const buf = await get(logoSrc, 'buf');
    await sharp(buf).resize({ width: 480, withoutEnlargement: true }).png().toFile(path.join(ROOT, 'public/img/logo.png'));
    logo = { src: logoSrc };
  }
  const sm = parse(await get(`${ORIGIN}/sitemap.xml`));
  const urls = [];
  for (const loc of sm.querySelectorAll('loc')) {
    const x = parse(await get(cdata(loc.text)));
    x.querySelectorAll('url > loc').forEach((l) => urls.push(cdata(l.text).replace(ORIGIN, '')));
  }

  await fs.writeFile(path.join(DATA, 'products.json'), JSON.stringify(out, null, 1));
  await fs.writeFile(path.join(DATA, 'categories.json'), JSON.stringify(catOut, null, 1));
  await fs.writeFile(path.join(DATA, 'pages.json'), JSON.stringify(pages, null, 1));
  await fs.writeFile(path.join(DATA, 'posts.json'), JSON.stringify(posts, null, 1));
  await fs.writeFile(path.join(DATA, 'old-urls.json'), JSON.stringify(urls, null, 1));
  await fs.writeFile(path.join(DATA, 'meta.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), source: ORIGIN, logo }, null, 1));
  console.log(`zapisano: ${out.length} produktów, ${catOut.length} kategorii, ${posts.length} wpisów, ${urls.length} starych URL`);
}

main().catch((e) => { console.error(e); process.exit(1); });
