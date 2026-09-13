
const fs = require("fs");
const files = [
  "src/pages/assets/AssetFormPage.tsx",
  "src/pages/assignments/AssignmentFormPage.tsx",
  "src/pages/departments/DepartmentFormPage.tsx",
  "src/pages/employees/EmployeeFormPage.tsx",
  "src/pages/maintenance/ReportIssuePage.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace the specific loading block
  const oldBlock = `  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <LoadingState />
      </div>
    );
  }`;
  const reportIssueBlock = `  if (loading || empLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <LoadingState />
      </div>
    );
  }`;

  if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, `  if (loading) {\n    return <LoadingState minHeight="min-h-[64px]" />;\n  }`);
  } else if (content.includes(reportIssueBlock)) {
    content = content.replace(reportIssueBlock, `  if (loading || empLoading) {\n    return <LoadingState minHeight="min-h-[64px]" />;\n  }`);
  }
  
  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");

