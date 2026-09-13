
const fs = require("fs");
const files = [
  "src/pages/assignments/AssignmentFormPage.tsx",
  "src/pages/departments/DepartmentFormPage.tsx",
  "src/pages/employees/EmployeeFormPage.tsx",
  "src/pages/maintenance/ReportIssuePage.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("import LoadingState")) {
    const depth = file.split("/").length - 2;
    const prefix = "../".repeat(depth);
    const importStr = `import LoadingState from "${prefix}components/common/LoadingState";\n`;
    
    // Add right after useAuthStore import
    content = content.replace(
      "import { useAuthStore }",
      importStr + "import { useAuthStore }"
    );
    fs.writeFileSync(file, content, "utf8");
  }
}
console.log("Done");

