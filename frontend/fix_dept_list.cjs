
const fs = require("fs");
let content = fs.readFileSync("src/pages/departments/DepartmentListPage.tsx", "utf8");

content = content.replace(
  /import { \n?.* } from "lucide-react";/,
  `$&
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";`
);

content = content.replace(
  /const \[deactivatingId, setDeactivatingId\] = useState<number \| null>\(null\);/,
  `$&
  const { addToast } = useToast();
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);`
);

content = content.replace(
  /const handleDeactivate = async \(id: number\) => {[\s\S]*?};/,
  `const executeDeactivate = async () => {
    if (!confirmDeactivateId) return;
    const id = confirmDeactivateId;
    setConfirmDeactivateId(null);
    setDeactivatingId(id);
    try {
      await departmentApi.deactivate(id);
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: "INACTIVE" } : d));
      addToast("success", "Department deactivated successfully.");
    } catch (err: any) {
      addToast("error", "Failed to deactivate department: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeactivatingId(null);
    }
  };`
);

content = content.replace(
  /onClick=\{\(\) => handleDeactivate\(dept.id\)\}/,
  `onClick={() => setConfirmDeactivateId(dept.id)}`
);

content = content.replace(
  /<\/div>\n\s*\);\n\}/,
  `
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
}`
);

fs.writeFileSync("src/pages/departments/DepartmentListPage.tsx", content, "utf8");

