import productsRaw from '../data/products.json';
import categoriesRaw from '../data/categories.json';
import postsRaw from '../data/posts.json';
import pagesRaw from '../data/pages.json';
import metaRaw from '../data/meta.json';
import { collections, type Collection } from '../data/catalog';

export interface Img { base: string; w: number; h: number; alt: string; original?: string }
export interface Product {
  id: number; name: string; slug: string; sku: string; price: number; regularPrice: number; onSale: boolean;
  inStock: boolean; stockText: string; categories: string[]; sizes: string[]; short: string; descHtml: string;
  setItems: string[]; spec: string[]; faq: { q: string; a: string }[]; seoTitle: string; seoDesc: string;
  oldUrl: string; images: Img[]; fixture?: boolean;
}
export interface Category { slug: string; name: string; descHtml: string; seoTitle: string; seoDesc: string; oldUrl: string }

// Treści przeniesione ze starego sklepu: puste <img>/<video> (bez src) out, stare adresy -> nowe.
const OLD_TO_NEW: Record<string, string> = Object.fromEntries([
  ['/tabela-rozmiarow-2/', '/tabela-rozmiarow/'],
  ...collections.flatMap((c) => c.old.map((o) => [o, `/${c.path}/`])),
]);
export function fixHtml(html = ''): string {
  return html
    .replace(/<p>\s*(<(img|video)>\s*(<\/video>)?\s*)+<\/p>/g, '')
    .replace(/<(img|video)>(\s*<\/video>)?/g, '')
    .replace(/href="(\/[^"]*)"/g, (m, h: string) => {
      const [path, hash = ''] = h.split('#');
      if (path.startsWith('/wp-content/')) return `href="https://gymcompression.pl${h}"`;
      const target = OLD_TO_NEW[path] || (path.startsWith('/product-category/') ? '/sklep/' : path);
      const prev = process.env.PREVIEW === '1';
      const clean = target.replace(/^\/|\/$/g, '');
      const out = prev ? (clean === '' ? '/index.html' : `/${clean}.html`) : (clean === '' ? '/' : `/${clean}/`);
      return `href="${out}${hash ? '#' + hash : ''}"`;
    });
}

export const products = (productsRaw as Product[]).map((p) => ({ ...p, descHtml: fixHtml(p.descHtml) })).sort((a, b) => b.id - a.id);
export const categories = (categoriesRaw as Category[]).map((c) => ({ ...c, descHtml: fixHtml(c.descHtml) }));
export const posts = postsRaw as { title: string; url: string; date: string; excerpt: string }[];
export const pages = Object.fromEntries(Object.entries(pagesRaw as Record<string, { title: string; html: string; seoDesc: string }>).map(([k, v]) => [k, { ...v, html: fixHtml(v.html) }]));
export const meta = metaRaw as { fixture?: boolean; fetchedAt?: string };
export const isPreview = import.meta.env.PREVIEW === '1' || process.env.PREVIEW === '1';
// Wersja robocza na hostingu (Render/Netlify): zwykłe adresy, ale noindex i pasek „Prototyp”.
export const isDraft = isPreview || process.env.DRAFT === '1';
// Wersja do pokazania (SHOWCASE=1): bez paska „Prototyp”, nadal noindex, żeby nie konkurować w Google z obecnym sklepem.
export const isShowcase = process.env.SHOWCASE === '1';
export const showBanner = isDraft && !isShowcase;

export const inCollection = (c: Collection) => products.filter((p) => p.categories.some((s) => c.woo.includes(s)));
export const catBySlug = (s: string) => categories.find((c) => c.slug === s);
export const productPath = (p: Product) => `product/${p.slug}`;

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
  if (n.startsWith('bluza')) return 'Bluza kompresyjna';
  return 'Odzież kompresyjna';
};
// Krótsza nazwa do kart: "5w1 Gym Compression Blue Shadow" -> "Blue Shadow"
export const colorway = (p: Product) => p.name.replace(/^(\dw1\s+)?(Rashguard z (krótkim|długim) rękawem|Rashguard z kapturem|Legginsy|Bluza kompresyjna|Bluza|Spodenki z legginsami)?\s*/i, '').replace(/^(Gym Compression|Spartan)\s*/i, '').trim() || p.name;
export const line = (p: Product) => (/spartan/i.test(p.name) ? 'Spartan' : 'Gym Compression');

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
