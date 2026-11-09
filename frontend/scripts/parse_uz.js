const fs = require('fs');

const svgContent = fs.readFileSync('c:/Users/Muhammad Aziz/Downloads/www.zaminflow.uz/frontend/scripts/uz.svg', 'utf8');

// Regex to capture path d, id, and name
const pathRegex = /<path\s+d="([^"]+)"\s+id="([^"]+)"\s+name="([^"]+)"/g;
let match;
const regions = [];

while ((match = pathRegex.exec(svgContent)) !== null) {
  const d = match[1];
  const id = match[2];
  const name = match[3];

  // Rough bounding box approximation from coordinates in d
  // Extract all numbers
  const nums = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
  let minX = 1000, maxX = 0, minY = 1000, maxY = 0;
  // d has both absolute and relative commands, but let's approximate or find starting point
  const startMatch = d.match(/^M\s*([0-9.]+)\s+([0-9.]+)/i);
  let startX = startMatch ? parseFloat(startMatch[1]) : 500;
  let startY = startMatch ? parseFloat(startMatch[2]) : 300;

  regions.push({
    id,
    name,
    d,
    startX,
    startY
  });
}

console.log('Parsed regions count:', regions.length);
regions.forEach(r => {
  console.log(`${r.id} (${r.name}): start at (${r.startX}, ${r.startY})`);
});

// Output clean JSON
fs.writeFileSync('c:/Users/Muhammad Aziz/Downloads/www.zaminflow.uz/frontend/scripts/uz_regions.json', JSON.stringify(regions, null, 2));
