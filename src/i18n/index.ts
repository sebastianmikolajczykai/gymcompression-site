// Wielojęzyczność: PL (domyślny, bez prefiksu), EN (/en/), UA (/uk/).
// Słownik jest kluczowany polskim tekstem: t(lang, 'Tekst po polsku') -> tłumaczenie albo PL, gdy brak.
import en from './en.json';
import uk from './uk.json';

export type Lang = 'pl' | 'en' | 'uk';
export const LANGS: Lang[] = ['pl', 'en', 'uk'];
export const FOREIGN: Lang[] = ['en', 'uk'];
// Języki widoczne dla Google (index, sitemap, hreflang). EN/UA mają robocze tłumaczenia,
// więc na start są noindex. Po weryfikacji tłumaczeń: ['pl', 'en', 'uk'].
export const INDEXED_LANGS: Lang[] = ['pl'];
export const LANG_LABEL: Record<Lang, string> = { pl: 'PL', en: 'EN', uk: 'UA' };
export const LANG_NAME: Record<Lang, string> = { pl: 'Polski', en: 'English', uk: 'Українська' };
export const HTML_LANG: Record<Lang, string> = { pl: 'pl', en: 'en', uk: 'uk' };
export const OG_LOCALE: Record<Lang, string> = { pl: 'pl_PL', en: 'en_GB', uk: 'uk_UA' };
export const NUM_LOCALE: Record<Lang, string> = { pl: 'pl-PL', en: 'en-GB', uk: 'uk-UA' };

const dict: Record<Lang, Record<string, string>> = { pl: {}, en: en as Record<string, string>, uk: uk as Record<string, string> };

export function langOf(pathname: string): Lang {
  const seg = pathname.replace(/^\/+/, '').split(/[/.]/)[0];
  return seg === 'en' || seg === 'uk' ? seg : 'pl';
}
export function t(lang: Lang, pl: string): string {
  if (lang === 'pl' || !pl) return pl;
  return dict[lang][pl] ?? dict[lang][pl.trim()] ?? pl;
}
// t z podstawieniem {n}
export function tf(lang: Lang, pl: string, vars: Record<string, string | number>): string {
  return t(lang, pl).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
// Odmiana liczebników (PL/UA: 1, 2–4, 5+; EN: 1, inne)
export function plural(lang: Lang, n: number, forms: [string, string, string]): string {
  const [one, few, many] = forms.map((f) => t(lang, f));
  if (n === 1) return one;
  if (lang === 'en') return few;
  const m10 = n % 10, m100 = n % 100;
  return m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
}

// Nazwy produktów: tłumaczymy tylko polski typ produktu i "5w1"; nazwy kolorów/linii zostają (to nazwy własne marki).
const NAME_PREFIX: Record<'en' | 'uk', [RegExp, string][]> = {
  en: [
    [/^Rashguard z długim rękawem/i, 'Long-sleeve rashguard'],
    [/^Rashguard z krótkim rękawem/i, 'Short-sleeve rashguard'],
    [/^Rashguard z kapturem/i, 'Hooded rashguard'],
    [/^Bluza kompresyjna/i, 'Compression hoodie'],
    [/^Bluza/i, 'Hoodie'],
    [/^Legginsy/i, 'Leggings'],
    [/^Spodenki z legginsami/i, 'Shorts with leggings'],
    [/^Zestaw kompresyjny/i, 'Compression set'],
  ],
  uk: [
    [/^Rashguard z długim rękawem/i, 'Рашгард з довгим рукавом'],
    [/^Rashguard z krótkim rękawem/i, 'Рашгард з коротким рукавом'],
    [/^Rashguard z kapturem/i, 'Рашгард з капюшоном'],
    [/^Bluza kompresyjna/i, 'Компресійне худі'],
    [/^Bluza/i, 'Худі'],
    [/^Legginsy/i, 'Легінси'],
    [/^Spodenki z legginsami/i, 'Шорти з легінсами'],
    [/^Zestaw kompresyjny/i, 'Компресійний комплект'],
  ],
};
export function pname(lang: Lang, name: string): string {
  if (lang === 'pl' || !name) return name;
  if (dict[lang][name]) return dict[lang][name];
  let out = name.replace(/^(\d)w1\b/, lang === 'en' ? '$1-in-1' : '$1 в 1');
  for (const [re, rep] of NAME_PREFIX[lang]) if (re.test(out)) { out = out.replace(re, rep); break; }
  return out.replace(/\bmęski\b/i, lang === 'en' ? "men's" : 'чоловічий').replace(/\bdamski\b/i, lang === 'en' ? "women's" : 'жіночий');
}
// Ścieżka kanoniczna z prefiksem języka (bez ukośników), do schema.org i hreflang.
export const lp = (lang: Lang, path: string) => (lang === 'pl' ? path : path ? `${lang}/${path}` : lang);
