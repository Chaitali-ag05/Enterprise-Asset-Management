const fs = require("fs");
// read using default (if it is utf-16, JS might fail, let us read it from buffer)
const buf = fs.readFileSync("src/pages/assignments/AssignmentFormPage.tsx");
let str = "";
// check if utf-16le
if (buf.length > 1 && buf[0] === 0xff && buf[1] === 0xfe) {
  str = buf.toString("utf16le");
} else {
  str = buf.toString("utf8");
}
// wait, maybe it just has some null bytes if it was encoded in UTF-16 without BOM
str = str.replace(/\0/g, "");
fs.writeFileSync("src/pages/assignments/AssignmentFormPage.tsx", str, "utf8");

