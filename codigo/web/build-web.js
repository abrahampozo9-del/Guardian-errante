// Versión para publicar (GitHub Pages): el mismo juego con el código minificado (más ligero y rápido de
// cargar en el móvil). El código legible sigue en src/ y en codigo/web del repositorio.
// Uso: node build-web.js SALIDA.html
const fs = require('fs');
let esbuild = null;
for (const p of ['esbuild', '/opt/npm-tools/node_modules/esbuild']) { try { esbuild = require(p); break; } catch (e) { } }
const js = fs.readdirSync('src').filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n');
let out = js;
if (esbuild) out = esbuild.transformSync(js, { minify: true, target: 'es2019', charset: 'utf8', legalComments: 'none' }).code;
else console.warn('esbuild no está: se publica sin minificar');
const shell = fs.readFileSync('shell.html', 'utf8');
const head = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Guardián">
<meta name="theme-color" content="#0b0907">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icono-180.png">
<link rel="icon" type="image/png" href="icono-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html,body{margin:0}</style>
`;
let body = shell.replace('/*__JS__*/', () => out).replace(/^<canvas id="juego"/m, '</head><body>\n<canvas id="juego"');
const tail = fs.readFileSync('install.html', 'utf8') + `
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
</body>
</html>
`;
const html = head + body + tail;
fs.writeFileSync(process.argv[2] || 'index.html', html);
console.log('publicado', Math.round(html.length / 1024) + ' KB (código ' + Math.round(js.length / 1024) + ' → ' + Math.round(out.length / 1024) + ' KB)');
