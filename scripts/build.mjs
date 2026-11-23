import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const fragment=readFileSync(new URL('src/prototype.html',root),'utf8');
const boot=readFileSync(new URL('scripts/offline-runtime.js',root),'utf8');
const document=`<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Interactief ontwerp voor Martijns Knalfeest. Open de kaart, finales en sidequests. Dit prototype simuleert de andere deelnemers.">
<meta name="referrer" content="no-referrer">
<title>Martijns Knalfeest — prototype</title>
<style>html{background:#e7eee5;color:#153933}body{margin:0;padding:12px;font-family:system-ui,sans-serif}.viz-dotted-background{background-image:radial-gradient(#15393323 .8px,transparent .8px);background-size:16px 16px}button,input{font:inherit}i[data-lucide]{font-style:normal;display:inline-flex;align-items:center;justify-content:center;min-width:18px}input:focus-visible,button:focus-visible{outline:3px solid #357bac;outline-offset:3px}@media(max-width:440px){body{padding:0}}</style>
</head>
<body>
<script>${boot}</script>
${fragment}
</body>
</html>
`;
writeFileSync(new URL('index.html',root),document);
console.log('Gemaakt: '+fileURLToPath(new URL('index.html',root)));
