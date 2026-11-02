const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await page.goto("http://127.0.0.1:8000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const info = await page.evaluate(async () => {
    const env = window.environment ? JSON.stringify(window.environment.publicFolders) : "no-env";
    const tryLoad = (url) => new Promise(res => { const im = new Image(); im.onload = () => res(url + " OK " + im.naturalWidth + "x" + im.naturalHeight); im.onerror = () => res(url + " FAIL"); im.src = url; });
    const results = [];
    for (const u of ["data/images/20261021_155718.jpg", "/data/images/20261021_155718.jpg"]) results.push(await tryLoad(u));
    return { env, results };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
