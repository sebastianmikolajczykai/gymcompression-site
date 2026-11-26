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
  desc?: string;         // opis meta (≤160 znaków); domyślnie opis z kategorii WooCommerce
  ownSeo?: boolean;      // nie bierz opisu i meta z kategorii WooCommerce (np. kolekcja łącząca kilka kategorii)
  line?: 'Spartan' | 'Gym Compression'; // tylko produkty danej linii (po nazwie produktu)
  exclude?: string[];    // kategorie WooCommerce, których produkty pomijamy (np. zestawy w „pojedynczych”)
}

// Opisy meta podkategorii zestawów (≤160 znaków, bez nowych twierdzeń względem opisów w sklepie)
const ZESTAW_DESC: Record<string, string> = {
  '2w1': 'Zestawy kompresyjne 2w1 dla mężczyzn – dwa dopasowane elementy odzieży kompresyjnej w jednym komplecie. Najprostszy start z kompresją.',
  '3w1': 'Zestawy kompresyjne 3w1 dla mężczyzn – trzy elementy odzieży treningowej w jednym komplecie. Na siłownię, crossfit i sporty walki.',
  '4w1': 'Zestawy kompresyjne 4w1 Gym Compression i Spartan – cztery elementy odzieży treningowej w jednym komplecie dla mężczyzn.',
  '5w1': 'Zestawy kompresyjne 5w1 dla mężczyzn – pięć elementów odzieży treningowej na każdy rodzaj treningu. Sprawdź kolory i rozmiary.',
  '7w1': 'Zestaw kompresyjny 7w1 – najbardziej rozbudowany komplet Gym Compression: siedem elementów odzieży treningowej w jednym zamówieniu.',
};

export const collections: Collection[] = [
  {
    path: 'sklep',
    name: 'Wszystkie produkty',
    h1: 'Odzież kompresyjna',
    title: 'Odzież kompresyjna męska i damska | Gym Compression',
    desc: 'Odzież kompresyjna Gym Compression: zestawy, rashguardy, legginsy, spodenki i bluzy na siłownię, crossfit i sporty walki. Sprawdź ofertę.',
    woo: ['odziez-kompresyjna', 'odziez-meska', 'odziez-damska'],
    old: ['/shop/', '/product-category/odziez-kompresyjna/'],
    intro: 'Zestawy, rashguardy, legginsy, spodenki i bluzy kompresyjne Gym Compression.',
  },
  {
    path: 'odziez-kompresyjna-meska',
    name: 'Mężczyźni',
    h1: 'Odzież kompresyjna męska',
    title: 'Odzież kompresyjna męska na siłownię | Gym Compression',
    desc: 'Męska odzież kompresyjna: rashguardy, legginsy, spodenki, bluzy i zestawy od 2w1 do 7w1. Wsparcie mięśni i swoboda ruchu na każdym treningu.',
    woo: ['odziez-meska'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/'],
    intro: 'Męska odzież kompresyjna i termoaktywna na siłownię, sporty walki, crossfit i bieganie.',
  },
  {
    path: 'zestawy-kompresyjne',
    name: 'Zestawy',
    h1: 'Zestawy kompresyjne męskie',
    title: 'Zestawy kompresyjne męskie 2w1–7w1 | Gym Compression',
    desc: 'Zestawy kompresyjne męskie od 2w1 do 7w1 – kompletny strój treningowy w jednym zamówieniu. Na siłownię, crossfit i MMA.',
    woo: ['zestawy-kompresyjne-meskie', 'zestawy-kompresyjne-meskie-2w1', 'zestawy-kompresyjne-meskie-3w1', 'zestawy-kompresyjne-meskie-4w1', 'zestawy-kompresyjne-meskie-5w1', 'zestawy-kompresyjne-meskie-7w1'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/zestawy-kompresyjne-meskie/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Komplety od 2 do 7 elementów. Im więcej elementów, tym więcej konfiguracji na różne warunki i intensywność treningu.',
  },
  ...(['2w1', '3w1', '4w1', '5w1', '7w1'] as const).map((n) => ({
    path: `zestawy-kompresyjne/${n}`,
    name: `Zestawy ${n}`,
    h1: `Zestawy kompresyjne ${n}`,
    title: `Zestaw kompresyjny ${n} męski | Gym Compression`,
    desc: ZESTAW_DESC[n],
    woo: [`zestawy-kompresyjne-meskie-${n}`],
    old: [`/product-category/odziez-kompresyjna/odziez-meska/zestawy-kompresyjne-meskie/zestawy-kompresyjne-meskie-${n}/`],
    parent: 'zestawy-kompresyjne',
    intro: `Męskie zestawy kompresyjne ${n}: ${n.charAt(0)} ${n.charAt(0) === '2' || n.charAt(0) === '3' || n.charAt(0) === '4' ? 'elementy' : 'elementów'} w jednym komplecie.`,
  })),
  // Linia Spartan jako osobna zakładka (uwaga Michała 26.11.2026). Na liście „Wszystkie” zestawy Spartan są razem z Gym Compression.
  {
    path: 'zestawy-kompresyjne/spartan',
    name: 'Edycja Spartan',
    h1: 'Zestawy kompresyjne Spartan',
    title: 'Zestawy kompresyjne Spartan męskie | Gym Compression',
    desc: 'Zestawy kompresyjne z linii Spartan: komplety 2w1, 3w1, 4w1 i 5w1 dla mężczyzn na siłownię, crossfit i sporty walki. Rozmiary M–3XL.',
    woo: ['zestawy-kompresyjne-meskie', 'zestawy-kompresyjne-meskie-2w1', 'zestawy-kompresyjne-meskie-3w1', 'zestawy-kompresyjne-meskie-4w1', 'zestawy-kompresyjne-meskie-5w1', 'zestawy-kompresyjne-meskie-7w1'],
    old: [],
    ownSeo: true,
    line: 'Spartan',
    parent: 'zestawy-kompresyjne',
    intro: 'Zestawy z linii Spartan: od 2 do 5 elementów w jednym komplecie.',
  },
  {
    path: 'rashguardy',
    name: 'Rashguardy',
    h1: 'Rashguardy kompresyjne',
    title: 'Rashguardy kompresyjne męskie | Gym Compression',
    desc: 'Rashguardy kompresyjne z krótkim i długim rękawem dla mężczyzn – na siłownię, BJJ, MMA i trening funkcjonalny.',
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
    title: 'Rashguard z długim rękawem męski – MMA, BJJ | Gym Compression',
    desc: 'Rashguardy z długim rękawem dla mężczyzn – kompresyjna koszulka na MMA, BJJ, kickboxing i crossfit. Chroni skórę i wspiera mięśnie.',
    woo: ['rashguardy-dlugi-rekaw'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/rashguardy-dlugi-rekaw/'],
    parent: 'rashguardy',
    intro: 'Rashguardy kompresyjne z długim rękawem.',
  },
  {
    path: 'rashguardy/krotki-rekaw',
    name: 'Krótki rękaw',
    h1: 'Rashguardy z krótkim rękawem',
    title: 'Rashguard z krótkim rękawem męski | Gym Compression',
    desc: 'Rashguardy z krótkim rękawem dla mężczyzn – lżejsza koszulka kompresyjna na siłownię, crossfit i cieplejsze treningi.',
    woo: ['rashguardy-krotki-rekaw'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/rashguardy-krotki-rekaw/'],
    parent: 'rashguardy',
    intro: 'Rashguardy kompresyjne z krótkim rękawem.',
  },
  {
    path: 'legginsy-kompresyjne',
    name: 'Legginsy',
    h1: 'Legginsy kompresyjne męskie',
    desc: 'Męskie legginsy kompresyjne Gym Compression – stabilizacja mięśni i komfort na siłowni, w bieganiu i sportach walki.',
    woo: ['legginsy'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/legginsy/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Męskie legginsy i spodnie kompresyjne.',
  },
  {
    path: 'spodenki-kompresyjne',
    name: 'Spodenki',
    h1: 'Spodenki kompresyjne męskie',
    title: 'Spodenki kompresyjne i sportowe męskie | Gym Compression',
    desc: 'Spodenki kompresyjne i sportowe dla mężczyzn – swoboda ruchu i wsparcie mięśni na siłowni, w crossficie i sportach walki.',
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
    desc: 'Męskie bluzy kompresyjne z kapturem – termoaktywne, na trening i na co dzień. Łączą styl streetwear z funkcjonalnością.',
    woo: ['bluzy'],
    old: ['/product-category/odziez-kompresyjna/odziez-meska/bluzy/'],
    parent: 'odziez-kompresyjna-meska',
    intro: 'Bluzy kompresyjne z kapturem.',
  },
  {
    path: 'odziez-kompresyjna-damska',
    name: 'Kobiety',
    h1: 'Odzież kompresyjna damska',
    desc: 'Damska odzież kompresyjna Gym Compression do treningu, sportu i aktywnego stylu życia. Sprawdź zestawy dla kobiet.',
    woo: ['odziez-damska', 'zestawy-kompresyjne-damskie', 'zestawy-kompresyjne-damskie-5w1'],
    old: ['/product-category/odziez-kompresyjna/odziez-damska/'],
    intro: 'Damska odzież kompresyjna: zestawy oraz pojedyncze legginsy, koszulki, longsleeve’y, topy i bluzy.',
  },
  {
    path: 'odziez-kompresyjna-damska/zestawy',
    name: 'Zestawy damskie',
    h1: 'Zestawy kompresyjne damskie',
    title: 'Zestawy kompresyjne damskie 2w1–5w1 | Gym Compression',
    desc: 'Damskie zestawy kompresyjne Gym Compression: komplety 2w1, 3w1 i 5w1 z legginsami, koszulką, longsleeve’em, topem lub bluzą.',
    woo: ['zestawy-kompresyjne-damskie', 'zestawy-kompresyjne-damskie-5w1'],
    old: [
      '/product-category/odziez-kompresyjna/odziez-damska/zestawy-kompresyjne-damskie/',
      '/product-category/odziez-kompresyjna/odziez-damska/zestawy-kompresyjne-damskie/zestawy-kompresyjne-damskie-5w1/',
    ],
    ownSeo: true,
    parent: 'odziez-kompresyjna-damska',
    intro: 'Damskie komplety kompresyjne: kilka elementów w jednym zamówieniu.',
  },
  {
    path: 'odziez-kompresyjna-damska/pojedyncze',
    name: 'Pojedyncze elementy',
    h1: 'Damska odzież kompresyjna: pojedyncze elementy',
    title: 'Legginsy, koszulki i bluzy kompresyjne damskie | Gym Compression',
    desc: 'Pojedyncza damska odzież kompresyjna Gym Compression: legginsy, koszulka, longsleeve, top sportowy i bluza z kapturem.',
    woo: ['odziez-damska'],
    exclude: ['zestawy-kompresyjne-damskie', 'zestawy-kompresyjne-damskie-5w1'],
    old: [],
    ownSeo: true,
    parent: 'odziez-kompresyjna-damska',
    intro: 'Legginsy, koszulki, longsleeve’y, topy i bluzy do skompletowania po swojemu.',
  },
];

export const byPath = (p: string) => collections.find((c) => c.path === p);

// Główne menu (kolejność = priorytet sprzedażowy)
// Mężczyźni / Kobiety na początku (uwaga Michała 26.11.2026), potem kategorie męskie. „Blog” jest w stopce.
export const mainNav = [
  { label: 'Mężczyźni', path: 'odziez-kompresyjna-meska', children: ['zestawy-kompresyjne', 'zestawy-kompresyjne/spartan', 'rashguardy', 'legginsy-kompresyjne', 'spodenki-kompresyjne', 'bluzy-kompresyjne'] },
  { label: 'Kobiety', path: 'odziez-kompresyjna-damska', children: ['odziez-kompresyjna-damska/zestawy', 'odziez-kompresyjna-damska/pojedyncze'] },
  { label: 'Zestawy', path: 'zestawy-kompresyjne', children: ['zestawy-kompresyjne/2w1', 'zestawy-kompresyjne/3w1', 'zestawy-kompresyjne/4w1', 'zestawy-kompresyjne/5w1', 'zestawy-kompresyjne/7w1', 'zestawy-kompresyjne/spartan'] },
  { label: 'Rashguardy', path: 'rashguardy', children: ['rashguardy/krotki-rekaw', 'rashguardy/dlugi-rekaw'] },
  { label: 'Legginsy', path: 'legginsy-kompresyjne' },
  { label: 'Spodenki', path: 'spodenki-kompresyjne' },
  { label: 'Bluzy', path: 'bluzy-kompresyjne' },
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
