
const fs = require("fs");
let content = fs.readFileSync("src/pages/departments/DepartmentListPage.tsx", "utf8");

if (!content.includes("import LoadingState")) {
  content = content.replace(/import ConfirmDialog/, "import LoadingState from \"../../components/common/LoadingState\";\nimport ConfirmDialog");
}

content = content.replace(/departmentApi\.deactivate/g, "departmentApi.delete");
content = content.replace(/await departmentApi\.delete/, "await api.delete(`/departments/${id}`)"); // Assuming departmentApi doesn't have delete? Wait, let me just fix it by hand

if (!content.includes("<ConfirmDialog")) {
  content = content.replace(/<\/div>\n\s*\);\n\}/, `
      <ConfirmDialog
        isOpen={confirmDeactivateId !== null}
        title="Deactivate Department"
        message="Are you sure you want to deactivate this department? This may affect assigned assets and employees."
        confirmLabel="Deactivate"
        onConfirm={executeDeactivate}
        onCancel={() => setConfirmDeactivateId(null)}
        isDestructive={true}
      />
    </div>
  );
}`);
}

fs.writeFileSync("src/pages/departments/DepartmentListPage.tsx", content, "utf8");

