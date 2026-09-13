
const fs = require("fs");

["src/components/common/ConfirmDialog.tsx", "src/components/common/EmptyState.tsx", "src/context/ToastContext.tsx"].forEach(f => {
  let content = fs.readFileSync(f, "utf8");
  content = content.replace(/import \{ ([^}]*)ReactNode([^}]*) \} from "react";/, `import { $1$2 } from "react";\nimport type { ReactNode } from "react";`);
  content = content.replace(/import {  } from "react";\n/, ""); // cleanup empty import
  fs.writeFileSync(f, content, "utf8");
});

