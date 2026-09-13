
const fs = require("fs");
let content = fs.readFileSync("src/pages/departments/DepartmentListPage.tsx", "utf8");
content = content.replace(/await departmentService\.delete\(id\)\(id\);/g, "await departmentService.delete(id);");
fs.writeFileSync("src/pages/departments/DepartmentListPage.tsx", content, "utf8");

