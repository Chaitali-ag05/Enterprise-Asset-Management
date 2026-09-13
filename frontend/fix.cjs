
const fs = require("fs");

let sidebar = fs.readFileSync("src/components/layout/Sidebar.tsx", "utf8");
sidebar = sidebar.replace("Wrench,", "");
fs.writeFileSync("src/components/layout/Sidebar.tsx", sidebar, "utf8");

let details = fs.readFileSync("src/pages/maintenance/MaintenanceDetailsPage.tsx", "utf8");
details = details.replace("User, Calendar, ", "");
details = details.replace(", CheckCircle, XCircle, AlertOctagon, HelpCircle", ", XCircle");
details = details.replace(/\s*MaintenanceWorkOrderResponse,/, "");
details = details.replace(/\s*AssignTechnicianRequest,/, "");
details = details.replace(/\s*RespondWorkOrderRequest,/, "");
details = details.replace(/\s*RejectWorkOrderRequest,/, "");
details = details.replace(/\s*CompleteRepairRequest,/, "");
details = details.replace(/\s*NotRepairableRequest,/, "");
details = details.replace(`e.designation === "TECHNICIAN" && `, "");
details = details.replace("(wo, i)", "(wo)");
details = details.replace("setSelectedTechId(e.target.value)", `setSelectedTechId(e.target.value === "" ? "" : Number(e.target.value))`);
fs.writeFileSync("src/pages/maintenance/MaintenanceDetailsPage.tsx", details, "utf8");

let list = fs.readFileSync("src/pages/maintenance/MaintenanceListPage.tsx", "utf8");
list = list.replace("Tool", "Wrench").replace("Tool", "Wrench");
list = list.replace("const [employeeMap, setEmployeeMap] = useState<Record<string, EmployeeResponse>>({});", "");
list = list.replace("setEmployeeMap(map);", "");
fs.writeFileSync("src/pages/maintenance/MaintenanceListPage.tsx", list, "utf8");

let techQueue = fs.readFileSync("src/pages/maintenance/TechnicianWorkOrderPage.tsx", "utf8");
techQueue = techQueue.replace("Tool", "Wrench").replace("Tool", "Wrench");
fs.writeFileSync("src/pages/maintenance/TechnicianWorkOrderPage.tsx", techQueue, "utf8");

