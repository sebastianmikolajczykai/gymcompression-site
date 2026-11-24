// Pobiera wpisy bloga z obecnego sklepu (WordPress REST API): treść, daty, zajawka, zdjęcie wyróżniające.
// Zapisuje src/data/posts.json i public/img/blog/<slug>.webp.
// Uruchom: node scripts/fetch-posts.mjs   (wymaga dostępu sieciowego do gymcompression.pl)
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'node-html-parser';

const ORIGIN = 'https://gymcompression.pl';
const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const UA = { 'user-agent': 'Mozilla/5.0 (prototype build; contact via site owner)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, as = 'json', tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return as === 'json' ? r.json() : Buffer.from(await r.arrayBuffer());
    } catch (e) { if (i === tries - 1) throw e; await sleep(800 * 2 ** i); }
  }
}
const decode = (s = '') => parse(`<div>${s}</div>`).text.replace(/\s+/g, ' ').trim();

// Treść wpisu: bez skryptów, stylów i atrybutów (zostaje href), linki do sklepu jako względne, h1 -> h2.
function cleanHtml(html = '') {
  const root = parse(`<div id="r">${html}</div>`);
  const wrap = root.querySelector('#r');
  root.querySelectorAll('script,style,input,button,iframe,img,figure,video').forEach((n) => n.remove());
  wrap.querySelectorAll('*').forEach((n) => {
    for (const a of Object.keys(n.attributes)) if (a !== 'href') n.removeAttribute(a);
    if (n.tagName === 'A') {
      const h = n.getAttribute('href') || '';
      if (h.startsWith(ORIGIN)) n.setAttribute('href', h.replace(ORIGIN, '') || '/');
    }
  });
  root.querySelectorAll('h1').forEach((n) => (n.tagName = 'h2'));
  return wrap.innerHTML.replace(/<(p|div|span|strong)>\s*(&nbsp;)?\s*<\/\1>/g, '').replace(/\s{2,}/g, ' ').trim();
}

export async function fetchPosts({ images = true } = {}) {
  let raw = [];
  for (let page = 1; page < 6; page++) {
    const batch = await get(`${ORIGIN}/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed=wp:featuredmedia&_fields=id,date,modified,slug,link,title,excerpt,content,_links,_embedded`);
    raw = raw.concat(batch);
    if (batch.length < 50) break;
  }
  const imgDir = path.join(ROOT, 'public/img/blog');
  await fs.mkdir(imgDir, { recursive: true });
  const posts = [];
  for (const b of raw) {
    const media = b._embedded?.['wp:featuredmedia']?.[0];
    let image = null;
    if (images && media?.source_url) {
      const file = path.join(imgDir, `${b.slug}.webp`);
      try {
        let meta;
        try { meta = await sharp(file).metadata(); } catch {
          const out = await sharp(await get(media.source_url, 'buf')).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer({ resolveWithObject: true });
          await fs.writeFile(file, out.data); meta = out.info;
        }
        image = { src: `/img/blog/${b.slug}.webp`, w: meta.width, h: meta.height, alt: decode(media.alt_text || '') || decode(b.title.rendered), original: media.source_url };
      } catch (e) { console.warn('zdjęcie wpisu', b.slug, e.message); }
    }
    posts.push({ id: b.id, date: b.date, modified: b.modified, slug: b.slug, url: b.link.replace(ORIGIN, ''), title: decode(b.title.rendered), excerpt: decode(b.excerpt.rendered), image, html: cleanHtml(b.content.rendered) });
  }
  return posts;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const posts = await fetchPosts();
  await fs.writeFile(path.join(ROOT, 'src/data/posts.json'), JSON.stringify(posts, null, 1));
  console.log(`zapisano ${posts.length} wpisów, ${posts.filter((p) => p.image).length} ze zdjęciem`);
}
