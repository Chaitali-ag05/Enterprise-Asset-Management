
const fs = require("fs");
let content = fs.readFileSync("src/components/layout/TopNavbar.tsx", "utf8");

content = content.replace(
  /import { useAuthStore } from "..\/..\/context\/useAuthStore";/,
  `import { useAuthStore } from "../../context/useAuthStore";\nimport { useUIStore } from "../../context/useUIStore";`
);

content = content.replace(
  /const { user } = useAuthStore\(\);/,
  `const { user } = useAuthStore();\n  const { toggleSidebar } = useUIStore();`
);

content = content.replace(
  /<button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-elevated rounded-lg">/,
  `<button onClick={toggleSidebar} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-elevated rounded-lg">`
);

fs.writeFileSync("src/components/layout/TopNavbar.tsx", content, "utf8");

