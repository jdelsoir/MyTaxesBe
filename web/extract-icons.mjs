import { readFileSync, writeFileSync, readdirSync } from 'fs';
const dir = 'icons-raw';
const out = {};
for (const f of readdirSync(dir).filter(f => f.endsWith('.svg'))) {
  const name = f.replace('.svg', '');
  let svg = readFileSync(`${dir}/${f}`, 'utf8');
  // inner = everything between first '>' (end of <svg ...>) and '</svg>'
  const inner = svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'))
    .replace(/\s+/g, ' ').trim();
  out[name] = inner;
}
const banner = '/* Lucide icons (https://lucide.dev) — ISC License, © Lucide Contributors. Inner SVG paths only; wrapped at render time. */\n';
writeFileSync('icons.js', banner + 'globalThis.ICONS = ' + JSON.stringify(out) + ';\n');
console.log('icons.js written:', Object.keys(out).length, 'icons');
