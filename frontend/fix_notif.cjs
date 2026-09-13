
const fs = require("fs");
let content = fs.readFileSync("src/pages/notifications/NotificationListPage.tsx", "utf8");
content = content.replace(/import LoadingState from "..\/..\/components\/common\/LoadingState";\n/, "");
fs.writeFileSync("src/pages/notifications/NotificationListPage.tsx", content, "utf8");

