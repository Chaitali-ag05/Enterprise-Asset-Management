
const fs = require("fs");
let content = fs.readFileSync("src/pages/maintenance/MaintenanceDetailsPage.tsx", "utf8");

content = content.replace(
  /import { \n?.* } from "lucide-react";/,
  `$&
import { useToast } from "../../context/ToastContext";`
);

content = content.replace(
  /const navigate = useNavigate\(\);/,
  `const navigate = useNavigate();\n  const { addToast } = useToast();`
);

content = content.replace(
  /alert\((.*)\);/g,
  `addToast("error", $1);`
);

fs.writeFileSync("src/pages/maintenance/MaintenanceDetailsPage.tsx", content, "utf8");

