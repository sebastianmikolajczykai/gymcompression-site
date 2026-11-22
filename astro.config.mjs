import { defineConfig } from 'astro/config';

// PREVIEW=1 -> build for the claude.ai preview (flat .html files, relative links, noindex).
const preview = process.env.PREVIEW === '1';

export default defineConfig({
  site: 'https://gymcompression.pl',
  trailingSlash: preview ? 'ignore' : 'always',
  build: {
    format: preview ? 'file' : 'directory',
    inlineStylesheets: 'always',
    assets: 'assets',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
