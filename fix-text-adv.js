const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'frontend/src/components'),
    path.join(__dirname, 'frontend/src')
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace text colors meant for dark mode (whites/light-greys) with var(--text-main) and var(--text-muted)

    // Replace standard CSS color declarations
    content = content.replace(/color(\s*):(\s*)#f8fafc/gi, 'color$1:$2var(--text-main)');
    content = content.replace(/color(\s*):(\s*)#cbd5e1/gi, 'color$1:$2var(--text-main)');
    content = content.replace(/color(\s*):(\s*)#e2e8f0/gi, 'color$1:$2var(--text-main)');
    content = content.replace(/color(\s*):(\s*)#94a3b8/gi, 'color$1:$2var(--text-muted)');

    // Replace JSX inline strings
    content = content.replace(/color(\s*):(\s*)"#f8fafc"/gi, 'color$1:$2"var(--text-main)"');
    content = content.replace(/color(\s*):(\s*)"#cbd5e1"/gi, 'color$1:$2"var(--text-main)"');
    content = content.replace(/color(\s*):(\s*)"#e2e8f0"/gi, 'color$1:$2"var(--text-main)"');
    content = content.replace(/color(\s*):(\s*)"#94a3b8"/gi, 'color$1:$2"var(--text-muted)"');

    // Fix some dark backgrounds we missed (like transparent #0b1120 or gradients that used rgba(15, 23, 42) inside CSS without decimal float)
    // Dashboard panel headers
    content = content.replace(/background(\s*):(\s*)rgba\(30, 41, 59, 1\)/gi, 'background$1:$2var(--bg-surface)');
    content = content.replace(/background(\s*):(\s*)rgba\(15, 23, 42, 1\)/gi, 'background$1:$2var(--bg-card)');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed Texts:', path.basename(filePath));
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
