// Wraps the self-contained `standalone.html` fragment (built for the Claude
// Artifact host, which supplies its own <head>/<body> skeleton) into a complete,
// valid HTML document for GitHub Pages — adding charset, viewport, the PWA
// manifest link, icons, theme-color and the service-worker registration.
// Output goes to web/dist/, which is what the Pages workflow publishes.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { createHash } from 'crypto';

const frag = readFileSync('standalone.html', 'utf8');
const i = frag.indexOf('</style>');
if (i === -1) throw new Error('standalone.html missing </style> — run build-artifact.mjs first');
const headInner = frag.slice(0, i + '</style>'.length); // <title>…</title><style>…css…</style>
const bodyInner = frag.slice(i + '</style>'.length);     // app markup + inlined scripts

const meta = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<meta name="description" content="See where Belgian tax money goes. Open data, federal budget, personal contribution. NL/FR/EN.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon-32.png" sizes="32x32">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="MyTaxesBe">`;

const swReg = `<script>if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>`;

const doc = `<!doctype html>
<html lang="nl">
<head>
${meta}
${headInner}
</head>
<body>
${bodyInner}
${swReg}
</body>
</html>
`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', doc);

// Version the SW cache by content hash so each deploy busts stale client caches.
const version = createHash('sha256').update(doc).digest('hex').slice(0, 12);
const sw = readFileSync('sw.js', 'utf8').replaceAll('__CACHE_VERSION__', version);
writeFileSync('dist/sw.js', sw);

const assets = ['manifest.webmanifest', 'icon.svg', 'favicon-32.png',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png'];
for (const f of assets) copyFileSync(f, 'dist/' + f);

console.log(`dist/index.html ${doc.length} bytes; sw cache mytaxesbe-${version}`);
