// Tabela rozmiarów przepisana z grafiki sklepu (wp-content/uploads/2025/12/tabela-rozmiarow.webp)
// oraz macierz z obecnego kalkulatora rozmiaru na kartach produktów. Bez zmian merytorycznych.
export const sizeTable = [
  { size: 'M', height: '155–175', chest: '85–105', weight: '60–75' },
  { size: 'L', height: '175–185', chest: '94–110', weight: '75–85' },
  { size: 'XL', height: '185–195', chest: '100–115', weight: '85–95' },
  { size: 'XXL', height: '185–200', chest: '104–120', weight: '95–105' },
  { size: '3XL', height: '190–215', chest: '115–145', weight: '105–150' },
];

export const heights = [155, 165, 170, 175, 180, 185, 190, 200, 215];
export const weights = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 150];
// Wiersz = wzrost, kolumna = waga. W oryginale wiersz 200 cm używa zapisu "2XL" = XXL.
export const matrix = [
  ['M', 'M', 'M', 'M', 'M', 'L', 'L', 'XL', 'XL', 'XXL', 'XXL', '3XL', '3XL'],
  ['M', 'M', 'M', 'M', 'M', 'L', 'L', 'XL', 'XL', 'XXL', 'XXL', '3XL', '3XL'],
  ['M', 'M', 'M', 'M', 'M', 'L', 'L', 'XL', 'XL', 'XXL', 'XXL', '3XL', '3XL'],
  ['M', 'M', 'M', 'M', 'L', 'L', 'L', 'XL', 'XL', 'XXL', 'XXL', '3XL', '3XL'],
  ['M', 'M', 'L', 'L', 'L', 'L', 'L', 'XL', 'XL', 'XL', 'XXL', '3XL', '3XL'],
  ['L', 'L', 'L', 'L', 'L', 'L', 'L', 'XL', 'XL', 'XL', 'XXL', '3XL', '3XL'],
  ['XL', 'XL', 'XL', 'XL', 'XL', 'XL', 'XL', 'XL', 'XL', 'XXL', 'XXL', '3XL', '3XL'],
  ['XXL', 'XXL', 'XXL', 'XXL', 'XXL', 'XXL', 'XXL', 'XXL', 'XXL', 'XXL', '3XL', '3XL', '3XL'],
  ['3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL', '3XL'],
];
