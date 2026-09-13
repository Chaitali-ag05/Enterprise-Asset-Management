
const fs = require("fs");
let content = fs.readFileSync("src/components/layout/Sidebar.tsx", "utf8");

content = content.replace(
  /import { useAuthStore } from "..\/..\/context\/useAuthStore";/,
  `import { useAuthStore } from "../../context/useAuthStore";\nimport { useUIStore } from "../../context/useUIStore";`
);

content = content.replace(
  /const { user, logout } = useAuthStore\(\);/,
  `const { user, logout } = useAuthStore();\n  const { sidebarOpen, setSidebarOpen } = useUIStore();`
);

content = content.replace(
  /<div className="flex flex-col w-64 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border h-full transition-colors">/,
  `{/* Mobile Overlay */}\n    {sidebarOpen && (\n      <div \n        className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"\n        onClick={() => setSidebarOpen(false)}\n      />\n    )}\n    \n    <div className={cn(\n      "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border h-full transition-transform duration-300 md:relative md:translate-x-0",\n      sidebarOpen ? "translate-x-0" : "-translate-x-full"\n    )}>`
);

content = content.replace(
  /to=\{item.href\}/g,
  `to={item.href} onClick={() => setSidebarOpen(false)}`
);

fs.writeFileSync("src/components/layout/Sidebar.tsx", content, "utf8");

