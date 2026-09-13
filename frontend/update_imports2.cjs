
const fs = require("fs");
const file = "src/pages/maintenance/TechnicianWorkOrderPage.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(/import \{ Wrench, Loader2, AlertTriangle, Eye, ArrowLeft \} from "lucide-react";/, `import { Wrench, AlertTriangle, Eye, ArrowLeft } from "lucide-react";`);
fs.writeFileSync(file, content, "utf8");
console.log("Done");

