// Składa słowniki src/i18n/en.json i uk.json z ui.tsv (pl\ten\tuk) oraz c*.tsv (indeks w content.json\ten\tuk).
import fs from 'node:fs';
const dir = new URL('./', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');
const content = JSON.parse(read('content.json'));
const en = {}, uk = {};
for (const line of read('ui.tsv').split('\n')) {
  if (!line.trim()) continue;
  const [pl, e, u] = line.split('\t');
  en[pl] = e; uk[pl] = u;
}
for (const f of fs.readdirSync(dir).filter((x) => /^c\d+\.tsv$/.test(x)).sort()) {
  for (const line of read(f).split('\n')) {
    if (!line.trim()) continue;
    const [i, e, u] = line.split('\t');
    const pl = content[+i];
    if (pl == null) throw new Error(`${f}: brak indeksu ${i}`);
    en[pl] = e; uk[pl] = u;
    if (pl.trim() !== pl) { en[pl.trim()] = e; uk[pl.trim()] = u; }
  }
}
const out = new URL('../../src/i18n/', dir);
fs.writeFileSync(new URL('en.json', out), JSON.stringify(en, null, 1));
fs.writeFileSync(new URL('uk.json', out), JSON.stringify(uk, null, 1));
const ui = JSON.parse(read('ui.json'));
const miss = [...ui, ...content].filter((s) => !(s in en));
console.log('wpisy:', Object.keys(en).length, 'brakujące:', miss.length, miss.slice(0, 10));
