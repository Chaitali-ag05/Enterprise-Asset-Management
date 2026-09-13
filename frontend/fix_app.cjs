
const fs = require("fs");
let app = fs.readFileSync("src/App.tsx", "utf8");
app = app.replace(
  /import NotificationListPage from ".\/pages\/notifications\/NotificationListPage";/,
  "import NotificationListPage from \"./pages/notifications/NotificationListPage\";\nimport NotFoundPage from \"./pages/NotFoundPage\";"
);
app = app.replace(
  /<\/Route>\s*<\/Route>\s*<\/Routes>/,
  "  <Route path=\"*\" element={<NotFoundPage />} />\n          </Route>\n        </Route>\n      </Routes>"
);
fs.writeFileSync("src/App.tsx", app, "utf8");

