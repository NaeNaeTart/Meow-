const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const stashPath = 'c:/Users/PC/Documents/Projects/Bots/Discord/Meow!/Meow! stash';
const files = fs.readdirSync(stashPath).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.gif') || f.endsWith('.png'));

async function check() {
    for (const file of files) {
        const metadata = await sharp(path.join(stashPath, file)).metadata();
        console.log(`${file}: ${metadata.width}x${metadata.height}`);
    }
}

check();
