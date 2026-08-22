const { loadImage, createCanvas } = require('canvas');
const path = require('path');

async function run() {
    const imgPath = path.join(__dirname, '../header.png');
    const img = await loadImage(imgPath);
    
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const { data } = imgData;
    
    const y = 250; // Scan row index 250 (scale 3)
    console.log(`Scanning row y = ${y} for border lines...`);
    
    let darkPixels = [];
    for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const a = data[idx+3];
        
        // Dark pixels (r, g, b < 100) and opaque
        if (a > 0 && r < 100 && g < 100 && b < 100) {
            darkPixels.push({ x, rgb: `rgb(${r},${g},${b})` });
        }
    }
    
    console.log("Found dark pixels at columns:");
    const columns = [...new Set(darkPixels.map(p => p.x))];
    columns.sort((a,b) => a-b);
    
    // We expect the left border and right border.
    // Let's filter to group adjacent columns and find the center of each vertical line.
    let lines = [];
    let currentLine = [];
    for (let i = 0; i < columns.length; i++) {
        if (currentLine.length === 0 || columns[i] === currentLine[currentLine.length - 1] + 1) {
            currentLine.push(columns[i]);
        } else {
            lines.push(Math.round(currentLine.reduce((sum, val) => sum + val, 0) / currentLine.length));
            currentLine = [columns[i]];
        }
    }
    if (currentLine.length > 0) {
        lines.push(Math.round(currentLine.reduce((sum, val) => sum + val, 0) / currentLine.length));
    }
    
    lines.forEach((col, idx) => {
        console.log(`Line ${idx + 1}: x = ${col} pixels (${(col / 3).toFixed(2)} pt from left)`);
    });
}

run().catch(console.error);
