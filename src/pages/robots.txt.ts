import { isDraft } from '../lib/shop';
export function GET() {
  const body = isDraft
    ? 'User-agent: *\nDisallow: /\n'
    : 'User-agent: *\nDisallow: /koszyk/\nDisallow: /*?add-to-cart=\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: https://gymcompression.pl/sitemap.xml\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
