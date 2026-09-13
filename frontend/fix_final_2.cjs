const fs = require('fs');
const path = require('path');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix imports
    content = content.replace(/import axios from "axios";\n/g, '');
    content = content.replace(/import \{ isAxiosError \} from "axios";\n/g, '');
    
    // Only import what's needed
    if (content.includes('isAxiosError') || content.includes('axios.isAxiosError')) {
        content = 'import axios, { isAxiosError } from "axios";\n' + content;
    }
    
    // Convert axios.isAxiosError to isAxiosError
    content = content.replace(/axios\.isAxiosError/g, 'isAxiosError');

    // Fix errMap || {}
    content = content.replace(/Object\.keys\(errMap\)/g, 'Object.keys(errMap || {})');
    content = content.replace(/errMap\[/g, '(errMap || {})[');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fix(fullPath);
        }
    });
}

walk('./src');
