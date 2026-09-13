
const fs = require("fs");

function fix(file) {
    let content = fs.readFileSync(file, "utf8");
    
    // Add import if not present
    if (!content.includes("formatDate")) {
        const depth = file.split("/").length - 2;
        const prefix = "../".repeat(depth);
        const importStr = `import { formatDate } from "${prefix}utils/formatDate";\n`;
        const lastImportIndex = content.lastIndexOf("import ");
        const endOfLastImport = content.indexOf("\n", lastImportIndex) + 1;
        content = content.slice(0, endOfLastImport) + importStr + content.slice(endOfLastImport);
    }

    if (file.includes("NotificationBell")) {
        content = content.replace(
            `  const formatTime = (isoString: string) => {\n    const d = new Date(isoString);\n    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});\n  };`,
            `  const formatTime = (isoString: string) => formatDate(isoString, true);`
        );
    } else {
        content = content.replace(
            `  const formatTime = (isoString: string) => {\n    const d = new Date(isoString);\n    return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" }) + " at " + d.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});\n  };`,
            `  const formatTime = (isoString: string) => formatDate(isoString, true);`
        );
    }
    
    fs.writeFileSync(file, content, "utf8");
}

fix("src/components/notifications/NotificationBell.tsx");
fix("src/pages/notifications/NotificationListPage.tsx");
console.log("Done");

