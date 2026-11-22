// Mapa przekierowań 301: stary adres -> nowy adres (do wdrożenia na serwerze / w wtyczce Redirection).
import { collections } from '../data/catalog';
import { products, productPath } from '../lib/shop';
export function GET() {
  const rows: string[][] = [['stary_url', 'nowy_url', 'typ']];
  for (const c of collections) for (const o of c.old) rows.push([o, `/${c.path}/`, 'kategoria']);
  for (const p of products) if (p.oldUrl && p.oldUrl !== `/${productPath(p)}/`) rows.push([p.oldUrl, `/${productPath(p)}/`, 'produkt']);
  rows.push(['/tabela-rozmiarow-2/', '/tabela-rozmiarow/', 'strona']);
  rows.push(['/cart/', '/koszyk/', 'strona']);
  return new Response(rows.map((r) => r.join(',')).join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
