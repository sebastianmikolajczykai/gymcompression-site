# Prototyp nowej strony gymcompression.pl (Astro)

Stan: architektura, szablony, SEO i dobór rozmiaru gotowe. Dane produktów = tymczasowe
(nazwy, ceny, kategorie z 21.11.2026, zastępcze zdjęcia), dopóki nie uruchomimy pobierania.

## Kolejne kroki (wymaga środowiska "Daniel Gym Compression" z dostępem do gymcompression.pl)
1. `npm install`
2. `node scripts/fetch-data.mjs`  -> pełne produkty, opisy, FAQ, specyfikacje, zdjęcia (480/960/1440 webp),
   kategorie z opisami i meta, strony dostawy/zwrotów, wpisy bloga, stare URL z sitemap.
3. Zdjęcie hero / lifestyle: tylko zdjęcia Daniela albo Unsplash (licencja Unsplash), źródła zapisać w src/data/credits.json.
4. `npx astro build` (produkcja) lub `node scripts/build-preview.mjs` (podgląd do Artifactu, noindex).
5. Testy: Lighthouse mobile (home, kategoria, produkt), Rich Results (schema), brak poziomego scrolla 390 px.

## Architektura URL
- produkty bez zmian: /product/<slug>/
- kategorie: nowe krótkie adresy (src/data/catalog.ts), 301 ze starych -> /przekierowania-301.csv
- /tabela-rozmiarow/ (HTML, nie obrazek), /koszyk/ (noindex), /sitemap.xml, /robots.txt
