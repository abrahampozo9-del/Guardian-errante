#!/bin/sh
# Genera la versión independiente (GitHub Pages) en ../guardian-web
D=/home/claude/guardian-web
cd "$(dirname "$0")"
JS=$(ls src/*.js | sort)
{
cat <<'H'
<!doctype html>
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
H
sed 's|/\*__JS__\*/|__JSHERE__|' shell.html | awk -v files="$JS" 'BEGIN{n=split(files,F,"\n")} /__JSHERE__/{for(i=1;i<=n;i++){while((getline l < F[i])>0) print l; close(F[i])} next} {print}' | sed 's|^<canvas id="juego"|</head><body>\n<canvas id="juego"|'
cat <<'H'
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
</body>
</html>
H
} > $D/index.html
cp src/*.js shell.html build.js build-github.sh $D/codigo/web/
