// TYMCZASOWE dane robocze (do czasu uruchomienia fetch-data.mjs).
// Nazwy, ceny, kategorie i dostępność odczytane z gymcompression.pl 21.11.2026; zdjęcia = neutralne zastępniki.
import fs from 'node:fs/promises';
import sharp from 'sharp';

const Z = (n) => ['odziez-kompresyjna', 'odziez-meska', `zestawy-kompresyjne-meskie-${n}`, 'zestawy-kompresyjne-meskie'];
const C = { L: ['legginsy', 'odziez-kompresyjna', 'odziez-meska'], S: ['odziez-kompresyjna', 'odziez-meska', 'spodenki'], B: ['bluzy', 'odziez-kompresyjna', 'odziez-meska'], RK: ['odziez-kompresyjna', 'odziez-meska', 'rashguardy-krotki-rekaw'], RD: ['odziez-kompresyjna', 'odziez-meska', 'rashguardy-dlugi-rekaw'] };
const rows = [
  ['3w1 Spartan Titanic Black', 198.99, Z('3w1')], ['5w1 Spartan Black & Grey', 305.09, Z('5w1')], ['4w1 Spartan Black & Blue', 278.99, Z('4w1')],
  ['3w1 Spartan Grey & Black', 198.99, Z('3w1')], ['3w1 Spartan Grey & Camo', 198.99, Z('3w1')], ['3w1 Spartan Black & Grey', 198.99, Z('3w1')],
  ['5w1 Spartan Grey & Camo', 309.99, Z('5w1')], ['5w1 Spartan Blue & Black', 319.99, Z('5w1')], ['5w1 Spartan Black', 309.99, Z('5w1')],
  ['Legginsy Gym Compression Eclipse Grey', 98.99, C.L], ['Spodenki z legginsami Gym Compression', 138.99, C.S, true, ['S', 'M', 'L', 'XL', 'XXL', '3XL']],
  ['Bluza kompresyjna Gym Compression Blue Shadow', 134.99, C.B], ['Legginsy Gym Compression Blue Shadow', 98.99, C.L], ['Bluza Gym Compression Urban Grey', 134.99, C.B],
  ['Legginsy Gym Compression Prime Black', 98.99, C.L], ['Legginsy Gym Compression Shadow Matrix', 106.19, C.L],
  ['Rashguard z krótkim rękawem Gym Compression Active Graphite', 118.99, C.RK], ['Rashguard z krótkim rękawem Gym Compression Prime Green', 118.99, C.RK],
  ['Rashguard z krótkim rękawem Gym Compression Prime Black', 118.99, C.RK], ['Rashguard z krótkim rękawem Gym Compression Air Mesh Black', 118.99, C.RK],
  ['Rashguard z krótkim rękawem Gym Compression Blue Shadow', 118.99, C.RK], ['Rashguard z kapturem Gym Compression Streed Hood', 118.99, C.RK],
  ['Rashguard z długim rękawem Gym Compression Blue Shadow', 124.99, C.RD], ['Rashguard z długim rękawem Gym Compression Eclipse Grey', 124.99, C.RD],
  ['Rashguard z długim rękawem Gym Compression Shadow Matrix', 124.99, C.RD], ['Rashguard z długim rękawem Gym Compression Black & White', 124.99, C.RD],
  ['Rashguard z długim rękawem Gym Compression Olive Black', 124.99, C.RD], ['Rashguard z krótkim rękawem Gym Compression Black Pixel', 118.99, C.RK],
  ['Bluza Gym Compression Black Pixel', 134.99, C.B], ['Rashguard z krótkim rękawem Gym Compression Shadow Matrix', 118.99, C.RK],
  ['Rashguard z krótkim rękawem Gym Compression Black & White', 118.99, C.RK], ['Bluza Gym Compression Black & White', 134.99, C.B],
  ['Bluza Gym Compression Shadow Matrix', 134.99, C.B], ['Bluza Gym Compression Olive Black', 134.99, C.B], ['2w1 Spartan Blitz Black & White', 169.99, Z('2w1')],
  ['Rashguard z długim rękawem Gym Compression Black Pixel', 124.99, C.RD, false], ['Rashguard z krótkim rękawem Gym Compression Olive Black', 118.99, C.RK],
  ['Bluza Gym Compression Obsidian Black', 134.99, C.B, false], ['5w1 Gym Compression Graphite Storm', 328.99, Z('5w1')], ['5w1 Gym Compression Obsidian Black', 328.99, Z('5w1')],
  ['5w1 Gym Compression Black & White', 338.99, Z('5w1')], ['5w1 Gym Compression Olive Black', 338.99, Z('5w1')], ['5w1 Gym Compression Shadow Matrix', 330.99, Z('5w1')],
  ['5w1 Gym Compression Black Pixel', 324.99, Z('5w1')], ['5w1 Gym Compression Dark Graphite', 334.99, Z('5w1')], ['4w1 Gym Compression Eclipse Grey', 278.99, Z('4w1')],
  ['3w1 Gym Compression Prime Black', 198.99, Z('3w1')], ['2w1 Gym Compression Air Mesh Black', 198.99, Z('2w1')], ['2w1 Gym Compression Prime Black Plus', 198.99, Z('2w1')],
  ['2w1 Gym Compression Prime Black', 169.99, Z('2w1')], ['2w1 Gym Compression Prime Green Plus', 198.99, Z('2w1')], ['2w1 Gym Compression Prime Green', 169.99, Z('2w1')],
  ['2w1 Gym Compression Street Hood Plus', 198.99, Z('2w1')], ['2w1 Gym Compression Street Hood', 169.99, Z('2w1')], ['2w1 Gym Compression Active Graphite Plus', 198.99, Z('2w1')],
  ['2w1 Gym Compression Active Graphite', 169.99, Z('2w1')], ['5w1 Gym Compression Blue Shadow', 333.99, Z('5w1')],
  ['5w1 Gym Compression Noir Fit', 324.99, ['odziez-damska', 'zestawy-kompresyjne-damskie-5w1', 'zestawy-kompresyjne-damskie']],
  ['5w1 Gym Compression Urban Grey', 324.99, Z('5w1')], ['7w1 Gym Compression Obsidian Black', 369.99, Z('7w1')],
];
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

await fs.mkdir('public/img/p', { recursive: true });
for (const w of [480, 960, 1440]) {
  const h = Math.round(w * 1.25);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#E9ECEB"/><text x="50%" y="50%" font-family="sans-serif" font-size="${w / 22}" fill="#8A9196" text-anchor="middle">zdjęcie produktu</text></svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 70 }).toFile(`public/img/p/placeholder-${w}.webp`);
}
const products = rows.map(([name, price, categories, inStock = true, sizes = ['M', 'L', 'XL', 'XXL', '3XL']], i) => ({
  id: 3000 - i, name, slug: slug(name), sku: '', price, regularPrice: price, onSale: false, inStock, stockText: '', categories, sizes,
  short: '', descHtml: '', setItems: [], spec: [], faq: [], seoTitle: '', seoDesc: '', oldUrl: `/product/${slug(name)}/`,
  images: [{ base: 'placeholder', w: 1440, h: 1800, alt: name, original: '' }], fixture: true,
}));
await fs.writeFile('src/data/products.json', JSON.stringify(products, null, 1));
for (const [f, v] of [['categories.json', []], ['pages.json', {}], ['posts.json', []], ['old-urls.json', []], ['meta.json', { fixture: true }]]) await fs.writeFile(`src/data/${f}`, JSON.stringify(v));
console.log('fixture', products.length);
