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
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".stage--start.stage--active", { timeout: 20000 });
  await page.evaluate((img) => {
    const rp = document.querySelector(".stage--result");
    rp.style.setProperty("--stage-background-image", "url(\"" + environment.publicFolders.images + "/" + img + "\")");
    document.querySelector(".stage--start").classList.remove("stage--active");
    rp.classList.add("stage--active");
    document.body.classList.add("mode--result");
    window.jQuery("#stickerCanvasOverlay").show();
    window.photoBooth.setBaseImage(img);
  }, IMG);
  await page.waitForFunction(() => { try { window.photoBooth.photoRect(); return true; } catch (e) { return false; } }, { timeout: 8000 });
  await page.click("#btnClassicOpenStickers");
  await page.waitForTimeout(600);
  await page.locator("#stickerModal .sticker-grid .sticker-item[data-asset]").first().click();
  await page.waitForTimeout(600);
  const imgSize = () => page.evaluate(() => {
    const img = document.querySelector("#stickerCanvasOverlay .placed-sticker.is-active .placed-sticker-content img");
    if (!img) return null;
    const r = img.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  console.log("img before drag:", JSON.stringify(await imgSize()));
  const handle = await page.locator("#stickerCanvasOverlay .placed-sticker.is-active .sticker-resize-btn").boundingBox();
  console.log("handle:", JSON.stringify(handle));
  if (handle) {
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle.x + 150, handle.y + 150, { steps: 15 });
    await page.mouse.up();
  }
  await page.waitForTimeout(400);
  console.log("img after drag:", JSON.stringify(await imgSize()));
  await page.screenshot({ path: path.join(output, "sticker-img-resize.png"), timeout: 60000 });
  await browser.close();
  console.log("done");
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
