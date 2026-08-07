const fs = require('fs');
const html = fs.readFileSync('client/landing.html','utf8');
const id = JSON.parse(fs.readFileSync('client/i18n/id.json','utf8'));
const keys = [];
const re = /data-i18n(?:-html|-placeholder|-title|-value)?=["']([^"']+)["']/g;
let m;
while ((m = re.exec(html))) {
  keys.push(m[1]);
}
const missing = [];
keys.forEach(k => {
  let o = id;
  k.split('.').forEach(p => {
    if (o != null) o = o[p];
  });
  if (o == null) missing.push(k);
});
console.log('keys', keys.length);
console.log('missing', missing.slice(0, 50));
if (missing.length) process.exit(1);
