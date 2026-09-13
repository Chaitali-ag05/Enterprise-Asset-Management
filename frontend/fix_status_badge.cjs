
const fs = require("fs");
let content = fs.readFileSync("src/components/common/StatusBadge.tsx", "utf8");

content = content.replace(
  /case "REJECTED":\s*case "NOT_REPAIRABLE":\s*/,
  ""
);

content = content.replace(
  /case "CANCELLED":\s*return "bg-slate-100/,
  `case "CANCELLED":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
        
      case "REJECTED":
      case "NOT_REPAIRABLE":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
        
      `
);

fs.writeFileSync("src/components/common/StatusBadge.tsx", content, "utf8");

