
const fs = require("fs");

function addDialog(filePath, dialogStr) {
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes("<ConfirmDialog")) {
    const splitIndex = content.lastIndexOf("</div>");
    if (splitIndex !== -1) {
      const before = content.slice(0, splitIndex);
      const after = content.slice(splitIndex);
      content = before + dialogStr + after;
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

addDialog("src/pages/employees/EmployeeListPage.tsx", `
      <ConfirmDialog
        isOpen={confirmDeactivateId !== null}
        title="Deactivate Employee"
        message="Are you sure you want to deactivate this employee? They will no longer be able to log in or be assigned new assets."
        confirmLabel="Deactivate"
        onConfirm={executeDeactivate}
        onCancel={() => setConfirmDeactivateId(null)}
        isDestructive={true}
      />
`);

addDialog("src/pages/departments/DepartmentListPage.tsx", `
      <ConfirmDialog
        isOpen={confirmDeactivateId !== null}
        title="Deactivate Department"
        message="Are you sure you want to deactivate this department? This may affect assigned assets and employees."
        confirmLabel="Deactivate"
        onConfirm={executeDeactivate}
        onCancel={() => setConfirmDeactivateId(null)}
        isDestructive={true}
      />
`);

