// Architektura sklepu: nowe, krótkie adresy kategorii + mapowanie na kategorie WooCommerce.
// `woo` = slugi kategorii w obecnym sklepie, `old` = obecne adresy (do przekierowań 301).
export interface Collection {
  path: string;          // nowy adres bez ukośników na końcu, np. "zestawy-kompresyjne/5w1"
  name: string;          // nazwa w menu / okruszkach
  h1: string;            // nagłówek strony
  woo: string[];         // kategorie WooCommerce, z których bierzemy produkty
  old: string[];         // stare adresy -> 301 na `path`
  parent?: string;
  intro: string;         // krótki lead nad listą (z opisu kategorii, bez nowych twierdzeń)
  noindex?: boolean;
  title?: string;        // tytuł strony (domyślnie: H1 + „| Gym Compression”)
  ownSeo?: boolean;      // nie bierz opisu i meta z kategorii WooCommerce (np. kolekcja łącząca kilka kategorii)
}

export const collections: Collection[] = [
  {
    path: 'sklep',
    name: 'Wszystkie produkty',
    h1: 'Odzież kompresyjna',
    woo: ['odziez-kompresyjna', 'odziez-meska', 'odziez-damska'],
    old: ['/shop/', '/product-category/odziez-kompresyjna/'],
    intro: 'Zestawy, rashguardy, legginsy, spodenki i bluzy kompresyjne Gym Compression.',
  },
  {
    path: 'odziez-kompresyjna-meska',
    name: 'Mężczyźni',
    h1: 'Odzież kompresyjna męska',
    woo: ['odziez-meska'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/'],
    intro: 'Męska odzież kompresyjna i termoaktywna na siłownię, sporty walki, crossfit i bieganie.',
  },
  {
    path: 'zestawy-kompresyjne',
    name: 'Zestawy',
    h1: 'Zestawy kompresyjne męskie',
    title: 'Zestawy kompresyjne męskie 2w1–7w1 | Gym Compression',
    woo: ['zestawy-kompresyjne-meskie', 'zestawy-kompresyjne-meskie-2w1', 'zestawy-kompresyjne-meskie-3w1', 'zestawy-kompresyjne-meskie-4w1', 'zestawy-kompresyjne-meskie-5w1', 'zestawy-kompresyjne-meskie-7w1'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/zestawy-kompresyjne-meskie/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Komplety od 2 do 7 elementów. Im więcej elementów, tym więcej konfiguracji na różne warunki i intensywność treningu.',
  },
  ...(['2w1', '3w1', '4w1', '5w1', '7w1'] as const).map((n) => ({
    path: `zestawy-kompresyjne/${n}`,
    name: `Zestawy ${n}`,
    h1: `Zestawy kompresyjne ${n}`,
    woo: [`zestawy-kompresyjne-meskie-${n}`],
    old: [`/product-category/odziez-kompresyjna/odziez-meska/zestawy-kompresyjne-meskie/zestawy-kompresyjne-meskie-${n}/`],
    parent: 'zestawy-kompresyjne',
    intro: `Męskie zestawy kompresyjne ${n}: ${n.charAt(0)} ${n.charAt(0) === '2' || n.charAt(0) === '3' || n.charAt(0) === '4' ? 'elementy' : 'elementów'} w jednym komplecie.`,
  })),
  {
    path: 'rashguardy',
    name: 'Rashguardy',
    h1: 'Rashguardy kompresyjne',
    woo: ['rashguardy-dlugi-rekaw', 'rashguardy-krotki-rekaw'],
    old: [],
    ownSeo: true,
    parent: 'odziez-kompresyjna-meska',
    intro: 'Rashguardy z krótkim i długim rękawem na siłownię, BJJ, MMA i trening funkcjonalny.',
  },
  {
    path: 'rashguardy/dlugi-rekaw',
    name: 'Długi rękaw',
    h1: 'Rashguardy z długim rękawem',
    woo: ['rashguardy-dlugi-rekaw'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/rashguardy-dlugi-rekaw/'],
    parent: 'rashguardy',
    intro: 'Rashguardy kompresyjne z długim rękawem.',
  },
  {
    path: 'rashguardy/krotki-rekaw',
    name: 'Krótki rękaw',
    h1: 'Rashguardy z krótkim rękawem',
    woo: ['rashguardy-krotki-rekaw'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/rashguardy-krotki-rekaw/'],
    parent: 'rashguardy',
    intro: 'Rashguardy kompresyjne z krótkim rękawem.',
  },
  {
    path: 'legginsy-kompresyjne',
    name: 'Legginsy',
    h1: 'Legginsy kompresyjne męskie',
    woo: ['legginsy'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/legginsy/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Męskie legginsy i spodnie kompresyjne.',
  },
  {
    path: 'spodenki-kompresyjne',
    name: 'Spodenki',
    h1: 'Spodenki kompresyjne męskie',
    woo: ['spodenki'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/spodenki/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Spodenki sportowe z wbudowanymi legginsami kompresyjnymi.',
  },
  {
    path: 'bluzy-kompresyjne',
    name: 'Bluzy',
    h1: 'Bluzy kompresyjne męskie',
    title: 'Bluzy kompresyjne męskie z kapturem | Gym Compression',
    woo: ['bluzy'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/bluzy/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Bluzy kompresyjne z kapturem.',
  },
  {
    path: 'odziez-kompresyjna-damska',
    name: 'Kobiety',
    h1: 'Odzież kompresyjna damska',
    woo: ['odziez-damska', 'zestawy-kompresyjne-damskie', 'zestawy-kompresyjne-damskie-5w1'],
    old: [
      '/product-category/odziez-kompresyjna/odziez-damska/',
      '/product-category/odziez-kompresyjna/odziez-damska/zestawy-kompresyjne-damskie/',
      '/product-category/odziez-kompresyjna/odziez-damska/zestawy-kompresyjne-damskie/zestawy-kompresyjne-damskie-5w1/',
    ],
    intro: 'Damskie zestawy kompresyjne.',
  },
];

export const byPath = (p: string) => collections.find((c) => c.path === p);

// Główne menu (kolejność = priorytet sprzedażowy)
export const mainNav = [
  { label: 'Zestawy', path: 'zestawy-kompresyjne', children: ['zestawy-kompresyjne/2w1', 'zestawy-kompresyjne/3w1', 'zestawy-kompresyjne/4w1', 'zestawy-kompresyjne/5w1', 'zestawy-kompresyjne/7w1'] },
  { label: 'Rashguardy', path: 'rashguardy', children: ['rashguardy/krotki-rekaw', 'rashguardy/dlugi-rekaw'] },
  { label: 'Legginsy', path: 'legginsy-kompresyjne' },
  { label: 'Spodenki', path: 'spodenki-kompresyjne' },
  { label: 'Bluzy', path: 'bluzy-kompresyjne' },
  { label: 'Kobiety', path: 'odziez-kompresyjna-damska' },
];

// Dane firmy z obecnej stopki gymcompression.pl
export const company = {
  name: 'Gym Compression',
  street: 'ul. Karola Szajnochy 3a',
  postal: '38-200',
  city: 'Jasło',
  phone: '+48 696 943 756',
  email: 'gymcompression@gmail.com',
};
