const fs = require('fs');
const js = fs.readdirSync('src').filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n');
const shell = fs.readFileSync('shell.html', 'utf8');
fs.writeFileSync('guardian.html', shell.replace('/*__JS__*/', () => js));
console.log('guardian.html', fs.statSync('guardian.html').size, 'bytes');
