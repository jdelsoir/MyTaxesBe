import { readFileSync, writeFileSync } from 'fs';
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('app.css', 'utf8');
const js = readFileSync('app.js', 'utf8');
const icons = readFileSync('icons.js', 'utf8');
const content = readFileSync('content.js', 'utf8');
const levels = readFileSync('levels.js', 'utf8');
const communes = readFileSync('data/communal-pit.json', 'utf8');
const DATA = {};
for (const y of [2023, 2024, 2025]) DATA[y] = JSON.parse(readFileSync(`data/federal-${y}.json`, 'utf8'));
// body inner, minus the external scripts (inlined below in order)
let body = html.split('<body>')[1].split('</body>')[0]
  .replace(/<script src="icons\.js"[^>]*><\/script>/, '')
  .replace(/<script src="content\.js"[^>]*><\/script>/, '')
  .replace(/<script src="levels\.js"[^>]*><\/script>/, '')
  .replace(/<script src="app\.js"[^>]*><\/script>/, '');
const out = `<title>Waar gaat mijn belastinggeld naartoe? — België</title>
<style>${css}</style>
${body}
<script>${icons}</script>
<script>${content}</script>
<script>${levels}</script>
<script>globalThis.__DATA__=${JSON.stringify(DATA)};</script>
<script>globalThis.__COMMUNES__=${communes};</script>
<script>${js}</script>`;
writeFileSync('standalone.html', out);
console.log('standalone.html', out.length, 'bytes');
