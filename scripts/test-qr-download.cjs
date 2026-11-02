const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8000";
const output = path.resolve(__dirname, "../.runtime/editor-bugs");
const IMG = "20261021_155718.jpg";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, hasTouch: true })).newPage();
  page.on("pageerror", e => console.log("PAGEERROR:", e.message));
  page.on("response", r => { if (r.url().includes("qrcode.php")) console.log("QR-API:", r.status(), r.url().split("?")[1]); });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stage--start.stage--active", { timeout: 20000 });
  await page.evaluate((img) => {
    document.querySelector(".stage--start").classList.remove("stage--active");
    window.photoBooth.renderPic(img);
  }, IMG);
  await page.waitForFunction(() => { try { window.photoBooth.photoRect(); return true; } catch (e) { return false; } }, { timeout: 8000 });
  await page.locator('[data-command="qrbtn"]').click();
  await page.waitForSelector(".modal .qr-dual-step img", { timeout: 20000 });
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll(".modal .qr-dual-step img"));
    return imgs.length === 2 && imgs.every(i => i.complete && i.naturalWidth > 0);
  }, { timeout: 20000 }).catch(() => console.log("imgs not all loaded within 20s"));
  const info = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll(".modal .qr-dual-step img"));
    return { loaded: imgs.map(i => ({ q: i.src.split("?")[1], ok: i.complete && i.naturalWidth > 0 })) };
  });
  console.log("modal:", JSON.stringify(info));
  await page.screenshot({ path: path.join(output, "qr-dual-modal.png"), timeout: 60000 });
  await browser.close();
  console.log("done");
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
