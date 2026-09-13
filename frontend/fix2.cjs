
const fs = require("fs");
let list = fs.readFileSync("src/pages/maintenance/MaintenanceListPage.tsx", "utf8");
list = list.replace(/Tool/g, "Wrench");
fs.writeFileSync("src/pages/maintenance/MaintenanceListPage.tsx", list, "utf8");

let techQueue = fs.readFileSync("src/pages/maintenance/TechnicianWorkOrderPage.tsx", "utf8");
techQueue = techQueue.replace(/Tool/g, "Wrench");
fs.writeFileSync("src/pages/maintenance/TechnicianWorkOrderPage.tsx", techQueue, "utf8");

