// Δημιουργεί τα εικονίδια της εφαρμογής (χρονόμετρο, χρώματα Archery Lab)
const fs = require('fs');
const path = require('path');
let sharp = null;
try { sharp = require('sharp'); } catch (e) {}

const DARK = '#1a1200';
const defs = '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc928"/><stop offset="1" stop-color="#ff9f1a"/></linearGradient></defs>';
const glyph = `<g fill="none" stroke="${DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<circle cx="54" cy="60" r="21"/><path d="M54 60V47"/><path d="M54 60l8 5"/></g>
<rect x="47" y="24" width="14" height="5" rx="2.5" fill="${DARK}"/>
<rect x="52" y="28" width="4" height="7" fill="${DARK}"/>
<rect x="70" y="35" width="10" height="5" rx="2.5" transform="rotate(45 75 37.5)" fill="${DARK}"/>
<circle cx="54" cy="60" r="2.8" fill="${DARK}"/>`;
const scaled = k => `<g transform="translate(54 54) scale(${k}) translate(-54 -54)">${glyph}</g>`;
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">${defs}${body}</svg>`;

const SVG = {
  foreground: wrap(`<rect width="108" height="108" fill="url(#g)"/>${glyph}`),
  legacy: wrap(`<rect width="108" height="108" rx="26" fill="url(#g)"/>${scaled(1.2)}`),
  round: wrap(`<circle cx="54" cy="54" r="54" fill="url(#g)"/>${scaled(1.1)}`)
};

if (!sharp) {
  fs.mkdirSync('icon-svg', { recursive: true });
  for (const k in SVG) fs.writeFileSync(`icon-svg/${k}.svg`, SVG[k]);
  console.log('sharp not found: wrote SVG files only');
  process.exit(0);
}

const res = path.join('android', 'app', 'src', 'main', 'res');
const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const fore = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

async function render(svg, size, file) {
  await sharp(Buffer.from(svg), { density: 72 * size / 108 })
    .resize(size, size).png().toFile(file);
}

(async () => {
  for (const d of Object.keys(legacy)) {
    const dir = path.join(res, `mipmap-${d}`);
    fs.mkdirSync(dir, { recursive: true });
    await render(SVG.legacy, legacy[d], path.join(dir, 'ic_launcher.png'));
    await render(SVG.round, legacy[d], path.join(dir, 'ic_launcher_round.png'));
    await render(SVG.foreground, fore[d], path.join(dir, 'ic_launcher_foreground.png'));
  }
  const vals = path.join(res, 'values');
  fs.mkdirSync(vals, { recursive: true });
  fs.writeFileSync(path.join(vals, 'ic_launcher_background.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <color name="ic_launcher_background">#FFB81C</color>\n</resources>\n');
  console.log('icons generated');
})().catch(e => { console.error(e); process.exit(1); });
