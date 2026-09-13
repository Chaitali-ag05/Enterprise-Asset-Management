
const fs = require("fs");
const file = "src/pages/assets/AssetFormPage.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace("import { useAuthStore }", "import LoadingState from \"../../components/common/LoadingState\";\nimport { useAuthStore }");
fs.writeFileSync(file, content, "utf8");

