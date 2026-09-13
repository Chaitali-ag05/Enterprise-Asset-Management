const fs = require('fs');
const path = require('path');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/if \(isAxiosError\(err\)/g, 'if (axios.isAxiosError(err)');
    content = content.replace(/if \(isAxiosError<\{/g, 'if (axios.isAxiosError<{');
    content = content.replace(/isAxiosError/g, 'axios.isAxiosError');
    // revert double replacements
    content = content.replace(/axios\.axios\.isAxiosError/g, 'axios.isAxiosError');

    // Fix err.response.data.errors where err is unknown (need casting inside the if block, or use type guard)
    // Actually, xios.isAxiosError<{errors: Record<string, string>}>(err) acts as a type guard! So err should be typed inside the block.
    // Let's replace const errMap = err.response.data.errors; with const errMap = axios.isAxiosError<{errors: Record<string, string>}>(err) ? err.response?.data?.errors : null;
    
    content = content.replace(/const errMap = err\.response\.data\.errors;/g, 'const errMap = axios.isAxiosError<{errors: Record<string, string>}>(err) ? err.response?.data?.errors : null;');
    content = content.replace(/setError\(err\.response\.data\.message\);/g, 'setError(axios.isAxiosError<{message: string}>(err) ? (err.response?.data?.message || "Error") : "Error");');
    
    // Check if axios is imported, if not add it
    if (content.includes('axios.isAxiosError') && !content.includes('import axios') && !content.includes('import { axios }') && !content.includes('import * as axios')) {
        content = 'import axios from "axios";\n' + content;
    }

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
