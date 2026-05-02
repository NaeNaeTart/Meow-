const fs = require('fs');
const path = require('path');
try {
    const data = fs.readFileSync(path.join(__dirname, 'Inter-Regular.ttf'));
    console.log('Read successfully, size:', data.length);
} catch (e) {
    console.error('Failed to read font:', e);
}
