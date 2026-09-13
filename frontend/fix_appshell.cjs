
const fs = require("fs");
let app = fs.readFileSync("src/components/layout/AppShell.tsx", "utf8");
app = app.replace(
  /import { NotificationProvider } from "..\/..\/context\/NotificationContext";/,
  "import { NotificationProvider } from \"../../context/NotificationContext\";\nimport { ToastProvider } from \"../../context/ToastContext\";"
);
app = app.replace(
  /<NotificationProvider>/,
  "<ToastProvider>\n    <NotificationProvider>"
);
app = app.replace(
  /<\/NotificationProvider>/,
  "</NotificationProvider>\n    </ToastProvider>"
);
fs.writeFileSync("src/components/layout/AppShell.tsx", app, "utf8");

