import { loadImage, createCanvas } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    const imgPath = path.join(__dirname, '../header.png');
    const img = await loadImage(imgPath);
    
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const { data } = imgData;
    
    const y = 200; // Scan row index 200 (scale 3)
    console.log(`Scanning row y = ${y} for border lines...`);
    
    let darkPixels = [];
    for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const a = data[idx+3];
        
        // Dark pixels
        if (a > 0 && r < 100 && g < 100 && b < 100) {
            darkPixels.push({ x, rgb: `rgb(${r},${g},${b})` });
        }
    }
    
    console.log("Found dark pixels at columns:");
    // Print unique columns
    const columns = [...new Set(darkPixels.map(p => p.x))];
    columns.sort((a,b) => a-b);
    columns.forEach(col => {
        console.log(`x = ${col} (${(col / 3).toFixed(2)} pt from left)`);
    });
}

run().catch(console.error);
