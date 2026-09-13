
const fs = require("fs");
let content = fs.readFileSync("src/context/ToastContext.tsx", "utf8");
content = content.replace(/, ,/, ",");
fs.writeFileSync("src/context/ToastContext.tsx", content, "utf8");

