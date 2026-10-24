const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'public', 'site-8', 'index.html');
let html = fs.readFileSync(target, 'utf8');

// Replace any corrupted characters in the seal or monograms
html = html.replace(/<div class="env-seal"><span>A[\s\S]*?K<\/span><\/div>/, '<div class="env-seal"><span>A · K</span></div>');
html = html.replace(/A \? K/g, 'A · K');

fs.writeFileSync(target, html, 'utf8');
console.log('Successfully sanitized site-8 index.html');
