
const fs = require("fs");
let admin = fs.readFileSync("src/components/dashboard/AdminDashboard.tsx", "utf8");
admin = admin.replace(/, Loader2/g, "");
fs.writeFileSync("src/components/dashboard/AdminDashboard.tsx", admin, "utf8");

let quick = fs.readFileSync("src/components/dashboard/QuickActions.tsx", "utf8");
quick = quick.replace(/PlusCircle, /g, "");
fs.writeFileSync("src/components/dashboard/QuickActions.tsx", quick, "utf8");

