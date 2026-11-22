// Buduje wersję podglądu (claude.ai Artifact): płaskie pliki .html, linki względne, noindex.
// Wynik: dist-preview/ + dist-preview/files.json (mapa plików do opublikowania obok index.html).
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist-preview');
execSync(`npx astro build --outDir ${OUT}`, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, PREVIEW: '1' } });

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p))); else out.push(p);
  }
  return out;
}
const all = await walk(OUT);
const rel = (fromFile, target) => {
  const r = path.relative(path.dirname(fromFile), path.join(OUT, target));
  return r || './';
};

for (const f of all.filter((f) => f.endsWith('.html'))) {
  let html = await fs.readFile(f, 'utf8');
  // atrybuty href/src/srcset oraz url() w CSS: "/x" -> względna ścieżka (pomija "//" i zewnętrzne)
  html = html.replace(/(src|data-img)="(\/img\/p\/[^"]+)-480\.webp"/g, '$1="$2-960.webp"');
  html = html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, a, t) => `${a}="${rel(f, t)}"`);
  // podgląd: tylko wersja 960 px (limit 511 plików w Artifact) (limit rozmiaru publikacji); 480/960 wystarczą do oglądania
  html = html.replace(/srcset="([^"]+)"/g, (_, v) => `srcset="${v.split(',').filter((s) => !/-(1440|480)\.webp\s/.test(s + ' ')).join(',')}"`);
  html = html.replace(/srcset="([^"]+)"/g, (_, v) => `srcset="${v.split(',').map((s) => { const [u, w] = s.trim().split(/\s+/); return (u.startsWith('/') && !u.startsWith('//') ? rel(f, u.slice(1)) : u) + (w ? ' ' + w : ''); }).join(', ')}"`);
  html = html.replace(/url\(\/(?!\/)([^)]+)\)/g, (_, t) => `url(${rel(f, t)})`);
  html = html.replace(/data-img="\/(?!\/)([^"]*)"/g, (_, t) => `data-img="${rel(f, t)}"`).replace(/data-url="\/(?!\/)([^"]*)"/g, (_, t) => `data-url="${rel(f, t)}"`);
  if (f === path.join(OUT, 'index.html')) {
    // Strona główna Artifactu jest owijana w szkielet dokumentu: usuń własny doctype/html/head/body.
    html = html.replace(/<!DOCTYPE html>/i, '').replace(/<html[^>]*>/i, '').replace(/<\/html>/i, '')
      .replace(/<head>/i, '').replace(/<\/head>/i, '').replace(/<body[^>]*>/i, '').replace(/<\/body>/i, '')
      .replace(/<meta charset="utf-8"\s*\/?>/i, '').replace(/<meta name="viewport"[^>]*>/i, '');
  }
  await fs.writeFile(f, html);
}
for (const f of all.filter((f) => /-(1440|480)\.webp$/.test(f))) await fs.rm(f);
const files = {};
for (const f of all.filter((f) => !/-(1440|480)\.webp$/.test(f))) {
  const r = path.relative(OUT, f);
  if (r === 'index.html' || r === 'files.json') continue;
  files[r] = path.relative(ROOT, f);
}
await fs.writeFile(path.join(OUT, 'files.json'), JSON.stringify(files, null, 1));
console.log(`podgląd: ${Object.keys(files).length + 1} plików w ${OUT}`);
