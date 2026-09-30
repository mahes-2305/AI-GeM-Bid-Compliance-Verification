const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'frontend/src/components'),
    path.join(__dirname, 'frontend/src')
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Fix broken CSS from previous bad regex (missing float)
    content = content.replace(/rgba\(0,\s*0,\s*0,\s*0\.\)/g, 'rgba(0, 0, 0, 0.1)');

    // 2. Eradicate dark backgrounds in .JSX inline styles
    content = content.replace(/rgba\(15,\s*23,\s*42,\s*0\.[0-9]+\)/g, 'var(--bg-surface)');
    content = content.replace(/rgba\(30,\s*41,\s*59,\s*0\.[0-9]+\)/g, 'var(--bg-surface)');

    // 3. For .css files, we do the same, plus #0f172a replacement ONLY in background properties
    content = content.replace(/background(-color)?\s*:\s*([^;}]*)#0b1120/g, 'background$1: var(--bg-dark)');
    content = content.replace(/background(-color)?\s*:\s*([^;}]*)#0f172a/g, 'background$1: var(--bg-dark)');

    // Fix radial-gradients using #0f172a
    content = content.replace(/,\s*#0f172a/g, ', var(--bg-dark)');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', path.basename(filePath));
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
