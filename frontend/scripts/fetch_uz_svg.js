const https = require('https');
const fs = require('fs');

https.get('https://simplemaps.com/static/svg/country/uz/admin1/uz.svg', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch_uz.svg', data);
    const viewBox = data.match(/viewBox="([^"]+)"/)?.[1];
    console.log('viewBox:', viewBox);
    const regex = /<path\s+d="([^"]+)"\s+id="([^"]+)"\s+name="([^"]+)"/g;
    let match;
    const regions = [];
    while ((match = regex.exec(data)) !== null) {
      regions.push({ id: match[2], name: match[3], dLength: match[1].length });
    }
    console.log('Regions count:', regions.length);
    console.log(JSON.stringify(regions, null, 2));
  });
});
