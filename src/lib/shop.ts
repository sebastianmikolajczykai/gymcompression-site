import productsRaw from '../data/products.json';
import categoriesRaw from '../data/categories.json';
import postsRaw from '../data/posts.json';
import pagesRaw from '../data/pages.json';
import metaRaw from '../data/meta.json';
import { collections, type Collection } from '../data/catalog';
import { productOverrides } from '../data/overrides';
// Zdjęcia na białym tle z aukcji Allegro Daniela (konto Sportodziez_GC), zgoda Michała 25.11.2026. Pierwsze w galerii, stare zostają dalej.
import allegroImagesRaw from '../data/allegro-images.json';
// Damska linia Noir Fit z aukcji Allegro Daniela (dane i zdjęcia zweryfikowane przez Sebastiana 26.11.2026). Nie ma ich w obecnym sklepie, więc bez oldUrl.
import allegroProductsRaw from '../data/allegro-products.json';

export interface Img { base: string; w: number; h: number; alt: string; original?: string }
export interface Product {
  id: number; name: string; slug: string; sku: string; price: number; regularPrice: number; onSale: boolean;
  inStock: boolean; stockText: string; categories: string[]; sizes: string[]; short: string; descHtml: string;
  setItems: string[]; spec: string[]; faq: { q: string; a: string }[]; seoTitle: string; seoDesc: string;
  oldUrl: string; images: Img[]; fixture?: boolean;
  // Najniższa cena z 30 dni przed obniżką (dyrektywa Omnibus). Bez niej nie pokazujemy promocji.
  lowest30?: number;
}
export interface Category { slug: string; name: string; descHtml: string; seoTitle: string; seoDesc: string; oldUrl: string }

// Treści przeniesione ze starego sklepu: puste <img>/<video> (bez src) out, stare adresy -> nowe.
const OLD_TO_NEW: Record<string, string> = Object.fromEntries([
  ['/tabela-rozmiarow-2/', '/tabela-rozmiarow/'],
  // Linki we wpisach bloga, które w obecnym sklepie prowadzą do 404
  ['/rashguardy-dlugi-rekaw/', '/rashguardy/dlugi-rekaw/'],
  ['/przewodnik-po-odziezie-do-mma/', '/najlepsza-odziez-do-mma-co-wybrac/'],
  ...collections.flatMap((c) => c.old.map((o) => [o, `/${c.path}/`])),
]);
const LIVE_ONLY = ['/pomoc/'];
export function fixHtml(html = ''): string {
  return html
    .replace(/<p>\s*(<(img|video)>\s*(<\/video>)?\s*)+<\/p>/g, '')
    .replace(/<(img|video)>(\s*<\/video>)?/g, '')
    .replace(/href="(\/[^"]*)"/g, (m, h: string) => {
      const [path, hash = ''] = h.split('#');
      // Strona, której prototyp jeszcze nie ma, zostaje w obecnym sklepie
      if (path.startsWith('/wp-content/') || LIVE_ONLY.includes(path)) return `href="https://gymcompression.pl${h}"`;
      const target = OLD_TO_NEW[path] || (path.startsWith('/product-category/') ? '/sklep/' : path);
      const prev = process.env.PREVIEW === '1';
      const clean = target.replace(/^\/|\/$/g, '');
      const out = prev ? (clean === '' ? '/index.html' : `/${clean}.html`) : (clean === '' ? '/' : `/${clean}/`);
      return `href="${out}${hash ? '#' + hash : ''}"`;
    });
}

const allegroImages = allegroImagesRaw as Record<string, Img>;
const withAllegro = (p: Product): Img[] => {
  const a = allegroImages[p.slug];
  return a ? [{ base: a.base, w: a.w, h: a.h, alt: a.alt, original: a.original }, ...p.images] : p.images;
};
export const products = [...(productsRaw as Product[]), ...(allegroProductsRaw as Product[])].map((p) => ({ ...p, ...productOverrides[p.slug], images: withAllegro(p), descHtml: fixHtml(p.descHtml) })).sort((a, b) => b.id - a.id);
export const categories = (categoriesRaw as Category[]).map((c) => ({ ...c, descHtml: fixHtml(c.descHtml) }));
export interface Post { id: number; date: string; modified: string; slug: string; url: string; title: string; excerpt: string; image: { src: string; w: number; h: number; alt: string; original: string } | null; html: string }
// Wpisy bloga (scripts/fetch-posts.mjs). Adresy jak w obecnym sklepie: /<slug>/.
export const posts = (postsRaw as Post[]).map((p) => ({ ...p, html: fixHtml(p.html) })).sort((a, b) => b.date.localeCompare(a.date));
export const postPath = (p: { slug: string }) => p.slug;
export const pages = Object.fromEntries(Object.entries(pagesRaw as Record<string, { title: string; html: string; seoDesc: string }>).map(([k, v]) => [k, { ...v, html: fixHtml(v.html) }]));
export const meta = metaRaw as { fixture?: boolean; fetchedAt?: string };
export const isPreview = import.meta.env.PREVIEW === '1' || process.env.PREVIEW === '1';
// Wersja robocza na hostingu (Render/Netlify): zwykłe adresy, ale noindex i pasek „Prototyp”.
export const isDraft = isPreview || process.env.DRAFT === '1';
// Wersja do pokazania (SHOWCASE=1): bez paska „Prototyp”, nadal noindex, żeby nie konkurować w Google z obecnym sklepem.
export const isShowcase = process.env.SHOWCASE === '1';
export const showBanner = isDraft && !isShowcase;

export const line = (p: { name: string }) => (/spartan/i.test(p.name) ? 'Spartan' : 'Gym Compression');
export const inCollection = (c: Collection) => products.filter((p) => p.categories.some((s) => c.woo.includes(s)) && !(c.exclude && p.categories.some((s) => c.exclude!.includes(s))) && (!c.line || line(p) === c.line));
export const catBySlug = (s: string) => categories.find((c) => c.slug === s);
export const productPath = (p: Product) => `product/${p.slug}`;

// Promocja pokazywana tylko z informacją Omnibus (najniższa cena z 30 dni przed obniżką, pole lowest30).
// Zgodnie z wytycznymi UOKiK obniżkę (przekreślenie i %) liczymy od lowest30, nie od ceny regularnej.
// Bez lowest30 sklep pokazuje samą aktualną cenę, bez przekreślenia i etykiety.
export function promo(p: Product): { ref: number; pct: number } | null {
  if (!p.onSale || typeof p.lowest30 !== 'number' || !(p.lowest30 > p.price)) return null;
  return { ref: p.lowest30, pct: Math.floor((1 - p.price / p.lowest30) * 100) };
}

// Wzór/kolorystyka z nazwy produktu (np. „Shadow Matrix”): ten sam wzór występuje jako rashguard, legginsy, bluza i zestaw.
// „Plus” to wariant zestawu, nie inny wzór.
export function design(p: { name: string }): string | null {
  const m = p.name.match(/(?:Gym Compression|Spartan)\s+(.+)$/);
  return m ? m[1].replace(/\s*\(.*\)$/, '').replace(/\s+Plus$/, '').trim() : null;
}
export const sameDesign = (p: Product) => {
  const d = design(p);
  return d ? products.filter((x) => x.id !== p.id && x.inStock && line(x) === line(p) && design(x) === d) : [];
};

// Pierwsza kolekcja "liść", do której należy produkt (okruszki, linki "wróć").
export function primaryCollection(p: Product): Collection {
  const leaf = collections.filter((c) => c.parent && inCollection(c).includes(p)).sort((a, b) => b.path.split('/').length - a.path.split('/').length || a.woo.length - b.woo.length);
  return leaf[0] || collections.find((c) => inCollection(c).includes(p) && c.path !== 'sklep') || collections[0];
}
export function trail(c: Collection): Collection[] {
  const out: Collection[] = [];
  let cur: Collection | undefined = c;
  while (cur) { out.unshift(cur); cur = cur.parent ? collections.find((x) => x.path === cur!.parent) : undefined; }
  return out;
}

export const pln = (n: number, lang: string = 'pl') => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang === 'uk' ? 'uk-UA' : 'pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
export const pieces = (p: Product) => { const m = p.name.match(/^(\d)w1/); return m ? Number(m[1]) : 1; };
export const kind = (p: Product) => {
  const n = p.name.toLowerCase();
  if (/^\dw1/.test(n)) return `Zestaw ${n.slice(0, 3)}`;
  if (n.startsWith('rashguard z długim')) return 'Rashguard, długi rękaw';
  if (n.startsWith('rashguard z krótkim')) return 'Rashguard, krótki rękaw';
  if (n.startsWith('rashguard z kapturem')) return 'Rashguard z kapturem';
  if (n.startsWith('legginsy')) return 'Legginsy kompresyjne';
  if (n.startsWith('spodenki')) return 'Spodenki z legginsami';
  if (n.startsWith('bluza damska')) return 'Bluza damska';
  if (n.startsWith('bluza')) return 'Bluza kompresyjna';
  if (n.startsWith('koszulka damska')) return 'Koszulka damska';
  if (n.startsWith('longsleeve')) return 'Longsleeve damski';
  if (n.startsWith('top sportowy')) return 'Top sportowy';
  return 'Odzież kompresyjna';
};
// Krótsza nazwa do kart: "5w1 Gym Compression Blue Shadow" -> "Blue Shadow"
export const colorway = (p: Product) => p.name.replace(/^(\dw1\s+)?(Rashguard z (krótkim|długim) rękawem|Rashguard z kapturem|Legginsy damskie|Koszulka damska z krótkim rękawem|Longsleeve damski|Bluza damska z kapturem|Top sportowy|Legginsy|Bluza kompresyjna|Bluza|Spodenki z legginsami)?\s*/i, '').replace(/^(Gym Compression|Spartan)\s*/i, '').trim() || p.name;

// Zdjęcia: wersje 480/960/1440 generowane przez fetch-data.mjs
export const imgSrc = (base: string, w = 960) => `/img/p/${base}-${w}.webp`;
export const srcset = (base: string) => [480, 960, 1440].map((w) => `/img/p/${base}-${w}.webp ${w}w`).join(', ');

// Link w obrębie strony: produkcja -> "/sciezka/", podgląd -> "/sciezka.html" (później zamieniane na względne).
export function href(path: string, lang: string = 'pl'): string {
  const raw = path.replace(/^\/|\/$/g, '');
  const clean = lang === 'pl' ? raw : raw ? `${lang}/${raw}` : lang;
  if (isPreview) return clean === '' ? '/index.html' : `/${clean}.html`;
  return clean === '' ? '/' : `/${clean}/`;
}
export const abs = (path: string) => new URL(path.replace(/^\/?/, '/').replace(/\/?$/, path ? '/' : ''), 'https://gymcompression.pl').toString().replace(/\/+$/, '/');
