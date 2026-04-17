// Sabah geometry extractor.
// Source: apps/bayu-app/Sabah_municipal_map.svg
// Layer-1 group has transform="translate(0, 358.63757)".
// Fills: #aaaaff = district polygons, #5555ff = highlighted islands/Labuan.
// Run: node app/bayu/_data/extract-sabah.js

const fs = require('fs');
const path = require('path');

const SRC = '/Users/hazman/holiday/holiday/apps/bayu-app/Sabah_municipal_map.svg';
const OUT = path.join(__dirname, 'sabah-geo.ts');

const svg = fs.readFileSync(SRC, 'utf8');

const TRANSLATE_Y = 358.63757;

// Extract every <path> tag's d + fill
const pathRe = /<path\s[\s\S]*?\/>/g;
const allPaths = [];
let m;
while ((m = pathRe.exec(svg)) !== null) {
  const full = m[0];
  const dM = full.match(/\sd="([^"]+)"/);
  const styleFill = full.match(/fill:([^;"]+)/);
  const attrFill = full.match(/\sfill="([^"]+)"/);
  const fill = styleFill ? styleFill[1].trim() : attrFill ? attrFill[1].trim() : null;
  if (dM && fill) allPaths.push({ d: dM[1], fill, len: dM[1].length });
}

function pathBBox(d) {
  let x = 0, y = 0, sx = 0, sy = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:[eE][+-]?\d+)?/g);
  if (!tok) return null;
  let cmd = null, i = 0;
  const up = () => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
  const rn = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    const t = tok[i];
    if (/[a-zA-Z]/.test(t)) { cmd = t; i++; continue; }
    switch (cmd) {
      case 'M': x = rn(); y = rn(); sx = x; sy = y; up(); cmd = 'L'; break;
      case 'm': x += rn(); y += rn(); sx = x; sy = y; up(); cmd = 'l'; break;
      case 'L': x = rn(); y = rn(); up(); break;
      case 'l': x += rn(); y += rn(); up(); break;
      case 'H': x = rn(); up(); break; case 'h': x += rn(); up(); break;
      case 'V': y = rn(); up(); break; case 'v': y += rn(); up(); break;
      case 'C': rn(); rn(); rn(); rn(); x = rn(); y = rn(); up(); break;
      case 'c': rn(); rn(); rn(); rn(); x += rn(); y += rn(); up(); break;
      case 'Q': case 'S': rn(); rn(); x = rn(); y = rn(); up(); break;
      case 'q': case 's': rn(); rn(); x += rn(); y += rn(); up(); break;
      case 'T': x = rn(); y = rn(); up(); break;
      case 't': x += rn(); y += rn(); up(); break;
      case 'A': rn(); rn(); rn(); rn(); rn(); x = rn(); y = rn(); up(); break;
      case 'a': rn(); rn(); rn(); rn(); rn(); x += rn(); y += rn(); up(); break;
      case 'Z': case 'z': x = sx; y = sy; break;
      default: i++;
    }
  }
  return { minX, minY, maxX, maxY };
}

// Build polygon records. Fills in this SVG:
//   #aaaaff : regular district council (Majlis Daerah)
//   #5555ff : municipal council (Majlis Perbandaran — Penampang, Sandakan, Tawau)
//   #000055 : city council (Dewan Bandaraya Kota Kinabalu — only KK has this)
function buildPolys(fill) {
  return allPaths
    .filter((p) => p.fill === fill)
    .map((p) => {
      const b = pathBBox(p.d);
      return {
        d: p.d, fill,
        bbox: b,
        cx: b ? (b.minX + b.maxX) / 2 : 0,
        cy: b ? (b.minY + b.maxY) / 2 : 0,
        area: b ? (b.maxX - b.minX) * (b.maxY - b.minY) : 0,
      };
    })
    .filter((p) => {
      if (!p.bbox) return false;
      const y0 = p.bbox.minY + TRANSLATE_Y;
      const y1 = p.bbox.maxY + TRANSLATE_Y;
      return y1 > 0 && y0 < 655 && p.bbox.maxX > 0 && p.bbox.minX < 794 && p.area > 100;
    });
}

// All district polygons (regular + municipal + city council) into one list.
// #000055 paths are filtered by area > 500 to drop vectorised text fragments.
const rawCityPolys = buildPolys('#000055').filter((p) => p.area > 500);
const districts = [...buildPolys('#aaaaff'), ...buildPolys('#5555ff'), ...rawCityPolys]
  .sort((a, b) => b.area - a.area);

// Small islands at the top of the map (#ffaaaa) → outlying northern islands
const highlights = allPaths
  .filter((p) => p.fill === '#ffaaaa')
  .map((p) => {
    const b = pathBBox(p.d);
    return {
      d: p.d, fill: '#ffaaaa',
      bbox: b,
      cx: b ? (b.minX + b.maxX) / 2 : 0,
      cy: b ? (b.minY + b.maxY) / 2 : 0,
      area: b ? (b.maxX - b.minX) * (b.maxY - b.minY) : 0,
    };
  })
  .filter((p) => {
    if (!p.bbox) return false;
    const y0 = p.bbox.minY + TRANSLATE_Y;
    const y1 = p.bbox.maxY + TRANSLATE_Y;
    return y1 > 0 && y0 < 655 && p.bbox.maxX > 0 && p.bbox.minX < 794 && p.area > 100;
  });

// Compute union bbox of all kept districts to set a tight viewport
const keep = [...districts, ...highlights];
const unionX0 = Math.min(...keep.map((p) => p.bbox.minX));
const unionX1 = Math.max(...keep.map((p) => p.bbox.maxX));
const unionY0 = Math.min(...keep.map((p) => p.bbox.minY + TRANSLATE_Y));
const unionY1 = Math.max(...keep.map((p) => p.bbox.maxY + TRANSLATE_Y));

// Pad 20px, clamp to source viewport
const pad = 20;
const vbX = Math.max(0, unionX0 - pad);
const vbY = Math.max(0, unionY0 - pad);
const vbW = Math.min(794 - vbX, unionX1 - vbX + pad);
const vbH = Math.min(655 - vbY, unionY1 - vbY + pad);

const out = [];
out.push('// Auto-extracted from Sabah_municipal_map.svg (Wikimedia, CC BY-SA).');
out.push('// Cropped tightly to Sabah district polygons only.');
out.push('// Inside the SVG, wrap paths in <g transform="translate(0, ' + TRANSLATE_Y + ')"> so coords align.');
out.push('// Regenerate: node app/bayu/_data/extract-sabah.js');
out.push('');
out.push('export const SABAH_VIEWBOX = {');
out.push('  x: ' + vbX.toFixed(2) + ',');
out.push('  y: ' + vbY.toFixed(2) + ',');
out.push('  width: ' + vbW.toFixed(2) + ',');
out.push('  height: ' + vbH.toFixed(2) + ',');
out.push('};');
out.push('');
out.push('export const SABAH_CONTENT_TRANSLATE_Y = ' + TRANSLATE_Y + ';');
out.push('');
out.push('// Rendered centroids already include translate applied.');
out.push('// cx = source cx, cy = source cy + translateY.');
out.push('export interface SabahGeoPath { id: string; d: string; cx: number; cy: number; area: number; }');

function emit(name, arr, prefix) {
  out.push('');
  out.push('export const ' + name + ': SabahGeoPath[] = [');
  arr.forEach((p, i) => {
    const cx = p.cx;
    const cy = p.cy + TRANSLATE_Y; // rendered centroid
    out.push('  { id: ' + JSON.stringify(prefix + i) +
      ', cx: ' + cx.toFixed(2) +
      ', cy: ' + cy.toFixed(2) +
      ', area: ' + p.area.toFixed(2) +
      ', d: ' + JSON.stringify(p.d) + ' },');
  });
  out.push('];');
}

emit('SABAH_DISTRICTS', districts, 'd');
emit('SABAH_HIGHLIGHTS', highlights, 'h');

const result = out.join('\n');
fs.writeFileSync(OUT, result);

console.log('tight viewBox:', vbX.toFixed(1), vbY.toFixed(1), vbW.toFixed(1) + 'x' + vbH.toFixed(1));
console.log('districts:', districts.length);
console.log('highlights:', highlights.length);
console.log('output size:', (result.length / 1024).toFixed(1) + ' KB');
console.log('Wrote:', OUT);
