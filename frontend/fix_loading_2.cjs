
const fs = require("fs");
const file = "src/components/notifications/NotificationBell.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(/<p className="text-sm">Loading\.\.\.<\/p>/g, "<LoadingState message=\"Loading...\" />");
fs.writeFileSync(file, content, "utf8");
console.log("Done");

