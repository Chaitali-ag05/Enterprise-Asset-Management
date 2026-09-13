
const fs = require("fs");
let content = fs.readFileSync("src/pages/employees/EmployeeListPage.tsx", "utf8");

// Add imports
content = content.replace(
  /import { \n?.* } from "lucide-react";/,
  `$&
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";`
);

// Inject hooks and state
content = content.replace(
  /const \[deactivatingId, setDeactivatingId\] = useState<number \| null>\(null\);/,
  `$&
  const { addToast } = useToast();
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);`
);

// Modify handleDeactivate
content = content.replace(
  /const handleDeactivate = async \(id: number\) => {[\s\S]*?};/,
  `const executeDeactivate = async () => {
    if (!confirmDeactivateId) return;
    const id = confirmDeactivateId;
    setConfirmDeactivateId(null);
    setDeactivatingId(id);
    try {
      await employeeApi.deactivate(id);
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: "INACTIVE" } : e));
      addToast("success", "Employee deactivated successfully.");
    } catch (err: any) {
      addToast("error", "Failed to deactivate employee: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeactivatingId(null);
    }
  };`
);

// Change onClick to set Confirm ID
content = content.replace(
  /onClick=\{\(\) => handleDeactivate\(emp.id\)\}/,
  `onClick={() => setConfirmDeactivateId(emp.id)}`
);

// Add Dialog at the end
content = content.replace(
  /<\/div>\n\s*\);\n\}/,
  `
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
}`
);

fs.writeFileSync("src/pages/employees/EmployeeListPage.tsx", content, "utf8");

