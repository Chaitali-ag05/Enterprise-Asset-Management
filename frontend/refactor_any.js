const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace catch (err: any) with catch (err: unknown)
    content = content.replace(/catch\s*\(\s*err\s*:\s*any\s*\)/g, 'catch (err: unknown)');

    // Replace err.response?.data?.message with (isAxiosError(err) ? err.response?.data?.message : undefined)
    content = content.replace(/err\.response\?\.data\?\.message/g, '(isAxiosError(err) ? err.response?.data?.message : undefined)');
    
    // Replace err.response?.data?.error with (isAxiosError(err) ? err.response?.data?.error : undefined)
    content = content.replace(/err\.response\?\.data\?\.error/g, '(isAxiosError(err) ? err.response?.data?.error : undefined)');

    // Replace err.response?.status with (isAxiosError(err) ? err.response?.status : undefined)
    content = content.replace(/err\.response\?\.status/g, '(isAxiosError(err) ? err.response?.status : undefined)');

    if (content !== original) {
      // Ensure isAxiosError is imported
      if (content.includes('isAxiosError(err)') && !content.includes('isAxiosError')) {
        // Find last import
        const importMatch = content.match(/^import .*?;\r?\n/m);
        if (importMatch) {
            content = 'import { isAxiosError } from "axios";\n' + content;
        }
      } else if (content.includes('isAxiosError(err)') && !content.includes('from "axios"')) {
         content = 'import { isAxiosError } from "axios";\n' + content;
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated', filePath);
    }
  }
});
