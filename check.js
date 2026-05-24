const fs = require('fs');
const html = fs.readFileSync('newtab.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const ids = [...script.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]);
const missing = ids.filter(id => !html.includes('id="'+id+'"') && !html.includes("id='"+id+"'"));
console.log('Missing IDs:', missing);
