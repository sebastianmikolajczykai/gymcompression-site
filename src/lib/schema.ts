import { abs, type Product } from './shop';

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const imgAbs = (p: Product) => p.images.filter((i) => i.original).map((i) => i.original!);

// Produkt: jedna oferta (cena wspólna dla rozmiarów w obecnym sklepie), bez ocen, bo sklep nie ma opinii.
export const productLd = (p: Product, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${abs(path)}#product`,
  name: p.name,
  url: abs(path),
  ...(p.sku ? { sku: p.sku } : {}),
  ...(imgAbs(p).length ? { image: imgAbs(p) } : {}),
  description: p.short || p.seoDesc || p.name,
  brand: { '@type': 'Brand', name: 'Gym Compression' },
  ...(p.sizes.length ? { size: p.sizes.join(', ') } : {}),
  offers: {
    '@type': 'Offer',
    url: abs(path),
    priceCurrency: 'PLN',
    price: p.price.toFixed(2),
    availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': 'https://gymcompression.pl/#organization' },
  },
});

export const faqLd = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const itemListLd = (items: { url: string; name: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: it.url, name: it.name })),
});
