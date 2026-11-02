const { chromium } = require("playwright");
const base = "http://127.0.0.1:8000";
const IMG = "20261021_155718.jpg";
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, hasTouch: true })).newPage();
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stage--start.stage--active", { timeout: 20000 });
  await page.evaluate((img) => {
    document.querySelector(".stage--start").classList.remove("stage--active");
    window.photoBooth.renderPic(img);
  }, IMG);
  await page.waitForFunction(() => { try { window.photoBooth.photoRect(); return true; } catch (e) { return false; } }, { timeout: 8000 });
  await page.locator('[data-command="qrbtn"]').click();
  await page.waitForSelector(".modal .qr-dual-step img", { timeout: 20000 });
  await page.waitForTimeout(800);
  const geo = await page.evaluate(() => {
    const out = {};
    for (const sel of [".modal", ".modal-inner", ".modal-body", ".modal-buttonbar"]) {
      const el = document.querySelector(sel);
      if (!el) { out[sel] = null; continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out[sel] = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), pos: cs.position, disp: cs.display, jc: cs.justifyContent, ai: cs.alignItems };
    }
    return out;
  });
  console.log(JSON.stringify(geo, null, 1));
  await browser.close();
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
