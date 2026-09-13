const fs = require('fs');
const path = require('path');

function replaceAsAny(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/if \(\(isAxiosError\(err\) \? \(err as any\)\.response\?\.data\?\.message : undefined\)\) \{/g, 'if (isAxiosError<{message?: string, errors?: Record<string, string>}>(err) && err.response?.data?.message) {');
    content = content.replace(/setError\(\(err as any\)\.response\.data\.message\);/g, 'setError(err.response.data.message);');
    content = content.replace(/const errMap = \(err as any\)\.response\.data\.errors;/g, 'const errMap = err.response.data.errors;');
    
    content = content.replace(/\(isAxiosError\(err\) \? \(isAxiosError\(err\) \? \(err as any\)\.response\?\.data\?\.message : undefined\) : undefined\)/g, '(isAxiosError<{message?: string}>(err) ? err.response?.data?.message : undefined)');
    content = content.replace(/\(isAxiosError\(err\) \? \(err as any\)\.response\?\.data\?\.message : undefined\)/g, '(isAxiosError<{message?: string}>(err) ? err.response?.data?.message : undefined)');
    
    content = content.replace(/if \(\(err as any\)\.response\?\.status === 403\) \{/g, 'if (isAxiosError(err) && err.response?.status === 403) {');
    content = content.replace(/if \(\(isAxiosError\(err\) && \(err as any\)\.response\?\.status\) === 404\) \{/g, 'if (isAxiosError(err) && err.response?.status === 404) {');
    content = content.replace(/if \(!\(err as any\)\.response\) \{/g, 'if (isAxiosError(err) && !err.response) {');
    content = content.replace(/\} else if \(\(err as any\)\.response\.status === 400\) \{/g, '} else if (isAxiosError(err) && err.response?.status === 400) {');
    content = content.replace(/\} else if \(\(err as any\)\.response\.status === 401 \|\| \(err as any\)\.response\.status === 403\) \{/g, '} else if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
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
            replaceAsAny(fullPath);
        }
    });
}

walk('./src');
