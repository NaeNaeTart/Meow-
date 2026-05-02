const fs = require('fs');
const data = fs.readFileSync('Inter-Regular.ttf');
console.log('Header:', data.slice(0, 4).toString('hex'));
console.log('Size:', data.length);
