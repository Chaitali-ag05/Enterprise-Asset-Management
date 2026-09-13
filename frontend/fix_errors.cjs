
const fs = require("fs");

let topnav = fs.readFileSync("src/components/layout/TopNavbar.tsx", "utf8");
topnav = topnav.replace(/<button className="relative p-2[^>]+>\s*<Bell size=\{20\} \/>\s*<span className="absolute[^>]+><\/span>\s*<\/button>/g, "<NotificationBell />");
topnav = topnav.replace(/import \{ Bell, Menu, Search \} from "lucide-react";/, "import { Menu, Search } from \"lucide-react\";");
fs.writeFileSync("src/components/layout/TopNavbar.tsx", topnav, "utf8");

let appshell = fs.readFileSync("src/components/layout/AppShell.tsx", "utf8");
appshell = appshell.replace(/return \(\s*<div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg">/, "return (\n    <NotificationProvider>\n    <div className=\"flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg\">");
appshell = appshell.replace(/<\/div>\s*<\/main>\s*<\/div>\s*<\/div>\s*\);/g, "</div>\n        </main>\n      </div>\n    </div>\n    </NotificationProvider>\n  );");
fs.writeFileSync("src/components/layout/AppShell.tsx", appshell, "utf8");

let notifContext = fs.readFileSync("src/context/NotificationContext.tsx", "utf8");
notifContext = notifContext.replace(/import \{ createContext, useContext, useState, useEffect, ReactNode \} from "react";/, "import { createContext, useContext, useState, useEffect } from \"react\";\nimport type { ReactNode } from \"react\";");
fs.writeFileSync("src/context/NotificationContext.tsx", notifContext, "utf8");

let notifBell = fs.readFileSync("src/components/notifications/NotificationBell.tsx", "utf8");
notifBell = notifBell.replace(/Trash2, /g, "");
fs.writeFileSync("src/components/notifications/NotificationBell.tsx", notifBell, "utf8");

let notifList = fs.readFileSync("src/pages/notifications/NotificationListPage.tsx", "utf8");
notifList = notifList.replace(/Trash2, /g, "");
notifList = notifList.replace(/import \{ Link, useNavigate \} from "react-router-dom";/, "import { useNavigate } from \"react-router-dom\";");
fs.writeFileSync("src/pages/notifications/NotificationListPage.tsx", notifList, "utf8");

