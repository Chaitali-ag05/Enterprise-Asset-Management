
const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Add imports if not present
  const addImport = (stmt, comp) => {
    if (!content.includes(stmt) && content.includes(comp)) {
      const match = content.match(/import .* from ".*";\n/g);
      if (match) {
        const lastMatch = match[match.length - 1];
        content = content.replace(lastMatch, lastMatch + stmt + "\n");
        modified = true;
      }
    }
  };

  // Replace Loading
  if (content.match(/<p>Loading[^<]*<\/p>/) || content.match(/<div>Loading[^<]*<\/div>/)) {
    content = content.replace(/<p>Loading[^<]*<\/p>/g, "<LoadingState />");
    content = content.replace(/<div>Loading[^<]*<\/div>/g, "<LoadingState />");
    modified = true;
  }
  
  addImport("import LoadingState from \"../../components/common/LoadingState\";", "<LoadingState");

  // Replace Empty State
  // This is a bit tricky, I will leave it to manual inspection or simple replacements
  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

processFile("src/pages/assets/AssetListPage.tsx");
processFile("src/pages/employees/EmployeeListPage.tsx");
processFile("src/pages/departments/DepartmentListPage.tsx");
processFile("src/pages/assignments/AssignmentListPage.tsx");
processFile("src/pages/maintenance/MaintenanceListPage.tsx");
processFile("src/pages/maintenance/TechnicianWorkOrderPage.tsx");
processFile("src/pages/notifications/NotificationListPage.tsx");

