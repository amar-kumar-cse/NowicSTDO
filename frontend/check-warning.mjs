import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'warning' || msg.type() === 'error') {
      const args = msg.args();
      if (args.length > 0) {
        Promise.all(args.map(a => a.jsonValue())).then(vals => {
          console.log(msg.type(), ':', ...vals);
        });
      } else {
        console.log(msg.type(), ':', msg.text());
      }
    }
  });
  await page.goto('http://localhost:5199/pricing', { waitUntil: 'networkidle0' });
  await browser.close();
})();
