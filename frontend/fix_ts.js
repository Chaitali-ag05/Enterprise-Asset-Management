const fs = require("fs");
let assetList = fs.readFileSync("src/pages/assets/AssetListPage.tsx", "utf-8");
assetList = assetList.replace("useNavigate,", "");
fs.writeFileSync("src/pages/assets/AssetListPage.tsx", assetList);

let empForm = fs.readFileSync("src/pages/employees/EmployeeFormPage.tsx", "utf-8");
// Let us just declare mId at the top of the useEffect block instead of having 2 declarations.
empForm = empForm.replace(/let mId = null;/g, "");
empForm = empForm.replace("const dept = departments.find(d => d.name === originalEmployee.departmentName);", "const dept = departments.find(d => d.name === originalEmployee.departmentName);\n      let mId = null;");
fs.writeFileSync("src/pages/employees/EmployeeFormPage.tsx", empForm);

