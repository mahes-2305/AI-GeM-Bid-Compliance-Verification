const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'frontend/src/components'),
    path.join(__dirname, 'frontend/src')
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace #fff and #ffffff exactly when used as values
    content = content.replace(/#ffffff/gi, 'var(--text-main)');
    content = content.replace(/#fff([^a-zA-Z0-9])/gi, 'var(--text-main)$1');

    // Replace dark backgrounds that were meant for dark theme (white-ish transparent)
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.([0-9]+)\)/g, 'rgba(0, 0, 0, 0.$1)');
    // Special jsx inline ones
    content = content.replace(/rgba\(255,255,255,0\.([0-9]+)\)/g, 'rgba(0,0,0,0.$1)');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', filePath);
    }
}

dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isFile() && (file.endsWith('.css') || file.endsWith('.jsx'))) {
                replaceInFile(fullPath);
            }
        });
    }
});
