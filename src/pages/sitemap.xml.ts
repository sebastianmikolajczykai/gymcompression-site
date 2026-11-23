import { collections } from '../data/catalog';
import { products, abs, productPath, inCollection } from '../lib/shop';
import { INDEXED_LANGS, lp } from '../i18n';

export function GET() {
  const base = [
    { path: '', pri: '1.0' },
    ...collections.filter((c) => !c.noindex && inCollection(c).length).map((c) => ({ path: c.path, pri: '0.8' })),
    ...products.map((p) => ({ path: productPath(p), pri: '0.7', img: p.images.filter((i) => i.original).map((i) => i.original) })),
    { path: 'tabela-rozmiarow', pri: '0.5' },
  ];
  // hreflang tylko gdy indeksujemy więcej niż jeden język (INDEXED_LANGS w src/i18n)
  const alt = (path: string) => INDEXED_LANGS.length < 2 ? '' :
    INDEXED_LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(lp(l, path))}"/>`).join('') +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(path)}"/>`;
  const rows = INDEXED_LANGS.flatMap((l) => base.map((u: any) =>
    `<url><loc>${abs(lp(l, u.path))}</loc><priority>${u.pri}</priority>${alt(u.path)}${l === 'pl' ? (u.img || []).map((i: string) => `<image:image><image:loc>${i}</image:loc></image:image>`).join('') : ''}</url>`));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows.join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
