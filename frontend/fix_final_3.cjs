const fs = require('fs');
const path = require('path');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unused imports
    content = content.replace(/import axios, \{ isAxiosError \} from "axios";/g, 'import { isAxiosError } from "axios";');

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
