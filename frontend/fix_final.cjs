const fs = require('fs');
const path = require('path');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/import axios from "axios";\nimport \{ axios\.isAxiosError \} from "axios";/g, 'import { isAxiosError } from "axios";');
    content = content.replace(/import \{ axios\.isAxiosError \} from "axios";/g, 'import { isAxiosError } from "axios";');
    content = content.replace(/axios\.isAxiosError/g, 'isAxiosError');
    
    // We also need to fix if (isAxiosError(err) etc since it's already there
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
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
