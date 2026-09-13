import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('requestfailed', request => {
    console.log('API FAILURE:', request.url(), request.failure().errorText);
  });
  page.on('response', response => {
    if (!response.ok()) {
      console.log('API ERROR RESPONSE:', response.url(), response.status());
    }
  });

  try {
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]');
    
    // Login as admin
    await page.type('input[type="email"]', 'admin');
    await page.type('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Login successful, current URL:', page.url());
    
    // Go to settings
    await page.goto('http://localhost:5173/settings');
    await page.waitForSelector('h1');
    console.log('Settings page loaded');
    
    // Go to dashboard
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(2000);
    console.log('Dashboard page loaded');
    
  } catch (err) {
    console.error('Puppeteer error:', err);
  } finally {
    await browser.close();
  }
})();