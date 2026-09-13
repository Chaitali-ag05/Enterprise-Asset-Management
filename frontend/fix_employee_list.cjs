
const fs = require("fs");
let content = fs.readFileSync("src/pages/employees/EmployeeListPage.tsx", "utf8");

if (!content.includes("import LoadingState")) {
  content = content.replace(/import ConfirmDialog/, "import LoadingState from \"../../components/common/LoadingState\";\nimport ConfirmDialog");
}

content = content.replace(/employeeApi\.deactivate/g, "employeeApi.delete");

// Ensure the ConfirmDialog is in the JSX
if (!content.includes("<ConfirmDialog")) {
  content = content.replace(/<\/div>\n\s*\);\n\}/, `
      <ConfirmDialog
        isOpen={confirmDeactivateId !== null}
        title="Deactivate Employee"
        message="Are you sure you want to deactivate this employee? They will no longer be able to log in or be assigned new assets."
        confirmLabel="Deactivate"
        onConfirm={executeDeactivate}
        onCancel={() => setConfirmDeactivateId(null)}
        isDestructive={true}
      />
    </div>
  );
}`);
}

fs.writeFileSync("src/pages/employees/EmployeeListPage.tsx", content, "utf8");

