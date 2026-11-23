// Poprawki danych pobranych z WooCommerce (fetch-data.mjs nadpisuje products.json, więc poprawki trzymamy tutaj).
// Te same błędy są w obecnym sklepie: po akceptacji Daniela poprawić też w WooCommerce.
export const productOverrides: Record<string, { short?: string; seoTitle?: string }> = {
  // W sklepie krótki opis był opisem zestawu 2w1 Spartan Blitz. Skład wg setItems tego produktu.
  '5w1-spartan-black': {
    short: 'Spartan Black 5w1 – bluza, rashguard krótki i długi rękaw, spodnie kompresyjne i szorty. Kompletny zestaw treningowy na każdą aktywność.',
  },
  // Ten sam tytuł SEO co „Street Hood” (bez Plus): dwie strony konkurowały o tę samą frazę.
  '2w1-gym-compression-street-hood-plus': {
    seoTitle: 'Zestaw kompresyjny 2w1 kaptur Street Hood Plus – Gym Compression',
  },
};
