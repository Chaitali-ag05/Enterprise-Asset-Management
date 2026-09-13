
const fs = require("fs");

const files = [
  "src/context/NotificationContext.tsx",
  "src/pages/assets/AssetFormPage.tsx",
  "src/pages/assignments/AssignmentFormPage.tsx",
  "src/pages/maintenance/MaintenanceDetailsPage.tsx",
  "src/pages/maintenance/MaintenanceListPage.tsx",
  "src/pages/maintenance/ReportIssuePage.tsx",
  "src/pages/maintenance/TechnicianWorkOrderPage.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");

  // In NotificationContext
  content = content.replace(
    /import \{ employeeApi \} from "\.\.\/api\/assetApi";/g,
    `import { employeeApi } from "../api/employeeApi";`
  );

  // In AssetFormPage
  content = content.replace(
    /import \{ assetApi, vendorApi, employeeApi \} from "\.\.\/\.\.\/api\/assetApi";/g,
    `import { assetApi } from "../../api/assetApi";\nimport { vendorApi } from "../../api/vendorApi";\nimport { employeeApi } from "../../api/employeeApi";`
  );

  // In AssignmentFormPage
  content = content.replace(
    /import \{ employeeApi, assetApi \} from "\.\.\/\.\.\/api\/assetApi";/g,
    `import { assetApi } from "../../api/assetApi";\nimport { employeeApi } from "../../api/employeeApi";`
  );

  // In MaintenanceDetailsPage, MaintenanceListPage, TechnicianWorkOrderPage
  content = content.replace(
    /import \{ employeeApi \} from "\.\.\/\.\.\/api\/assetApi";/g,
    `import { employeeApi } from "../../api/employeeApi";`
  );

  // In ReportIssuePage
  content = content.replace(
    /import \{ employeeApi, assetApi \} from "\.\.\/\.\.\/api\/assetApi";/g,
    `import { assetApi } from "../../api/assetApi";\nimport { employeeApi } from "../../api/employeeApi";`
  );

  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");

