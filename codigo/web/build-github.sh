#!/bin/sh
# Genera la versión publicable (GitHub Pages) en ../guardian-web: código minificado + fuentes legibles en codigo/web
D=/home/claude/guardian-web
cd "$(dirname "$0")"
node build-web.js $D/index.html
mkdir -p $D/codigo/web/test
cp src/*.js shell.html install.html build.js build-web.js build-github.sh $D/codigo/web/
cp test/*.js $D/codigo/web/test/
