
const fs = require("fs");
const files = [
  "src/pages/assets/AssetFormPage.tsx",
  "src/pages/assignments/AssignmentFormPage.tsx",
  "src/pages/departments/DepartmentFormPage.tsx",
  "src/pages/employees/EmployeeFormPage.tsx",
  "src/pages/maintenance/ReportIssuePage.tsx",
  "src/components/notifications/NotificationBell.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace <p>Loading...</p>
  content = content.replace(/<p>Loading\.\.\.<\/p>/g, "<LoadingState />");
  
  // Ensure LoadingState is imported
  if (!content.includes("LoadingState")) {
    const depth = file.split("/").length - 2; // e.g., src/pages/assets -> 2 levels deep
    const prefix = "../".repeat(depth);
    const importStr = `import LoadingState from "${prefix}components/common/LoadingState";\n`;
    
    // Insert after last import
    const lastImportIndex = content.lastIndexOf("import ");
    const endOfLastImport = content.indexOf("\n", lastImportIndex) + 1;
    content = content.slice(0, endOfLastImport) + importStr + content.slice(endOfLastImport);
  }
  
  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");

