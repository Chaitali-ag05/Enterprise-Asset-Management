
const fs = require("fs");
["src/pages/assets/AssetListPage.tsx", "src/pages/employees/EmployeeListPage.tsx", "src/pages/departments/DepartmentListPage.tsx", "src/pages/assignments/AssignmentListPage.tsx", "src/pages/maintenance/MaintenanceListPage.tsx", "src/pages/maintenance/TechnicianWorkOrderPage.tsx", "src/pages/notifications/NotificationListPage.tsx"].forEach(f => {
  let content = fs.readFileSync(f, "utf8");
  if (!content.includes("import LoadingState")) {
    content = content.replace(/import \{.*\} from "react";/, `$&
import LoadingState from "../../components/common/LoadingState";`);
    fs.writeFileSync(f, content, "utf8");
  }
});

