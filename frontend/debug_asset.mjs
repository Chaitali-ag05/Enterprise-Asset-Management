import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";

async function debugAsset() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
  await page.type('input[type="text"]', "admin");
  await page.type('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.pathname === "/dashboard" || window.location.pathname === "/");

  // Go to /assets/new
  await page.goto(`${BASE_URL}/assets/new`, { waitUntil: "networkidle0" });
  await page.waitForSelector('input[name="assetName"]');

  const uniqueId = Date.now().toString();
  await page.type('input[name="assetName"]', `QA Laptop ${uniqueId.slice(-4)}`);
  await page.type('input[name="serialNumber"]', `SN-${uniqueId}`);
  await page.type('input[name="brand"]', "HP");
  await page.type('input[name="model"]', "EliteBook 840");
  await page.type('input[name="purchaseDate"]', "2026-01-15");
  await page.type('input[name="purchaseCost"]', "1200.00");
  await page.type('input[name="warrantyExpiry"]', "2028-01-15");

  // Select department
  const deptOptions = await page.$$eval('select[name="departmentId"] option', opts => opts.map(o => ({ value: o.value, text: o.innerText })));
  console.log("Dept options:", deptOptions);
  const deptVal = deptOptions.find(o => o.value && o.value !== "")?.value;
  if (deptVal) await page.select('select[name="departmentId"]', deptVal);

  // Select vendor
  const vendorOptions = await page.$$eval('select[name="vendorId"] option', opts => opts.map(o => ({ value: o.value, text: o.innerText })));
  console.log("Vendor options:", vendorOptions);
  const vendorVal = vendorOptions.find(o => o.value && o.value !== "")?.value;
  if (vendorVal) await page.select('select[name="vendorId"]', vendorVal);

  // Click submit
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  console.log("URL after submit:", page.url());

  const err = await page.$eval('.bg-danger\\/10', el => el.innerText).catch(() => null);
  console.log("Error banner on page:", err);

  await browser.close();
}

debugAsset().catch(console.error);