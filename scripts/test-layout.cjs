const path = require("node:path");
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8000";
const output = path.resolve(__dirname, "../.runtime/editor-bugs");
const IMG = "20261021_155718.jpg";
(async () => {
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
  const measure = () => page.evaluate(() => {
    const sb = document.querySelector(".stage--result .result-sidebar");
    const ov = document.querySelector("#stickerCanvasOverlay");
    const sbr = sb.getBoundingClientRect();
    const ovr = ov.getBoundingClientRect();
    return {
      sidebar: { x: Math.round(sbr.x), y: Math.round(sbr.y), w: Math.round(sbr.width), h: Math.round(sbr.height) },
      photo: { x: Math.round(ovr.x), y: Math.round(ovr.y), w: Math.round(ovr.width), h: Math.round(ovr.height) },
      overlap: !(sbr.right <= ovr.left || ovr.right <= sbr.left || sbr.bottom <= ovr.top || ovr.bottom <= sbr.top),
      viewport: { w: innerWidth, h: innerHeight },
      sidebarOnscreen: sbr.left >= 0 && sbr.right <= innerWidth && sbr.top >= 0 && sbr.bottom <= innerHeight,
      photoOnscreen: ovr.left >= 0 && ovr.right <= innerWidth && ovr.top >= 0 && ovr.bottom <= innerHeight
    };
  });
  for (const vp of [{w:1920,h:1080},{w:1366,h:768},{w:1024,h:768},{w:800,h:600},{w:700,h:900},{w:500,h:800}]) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(700);
    console.log(vp.w + "x" + vp.h + ":", JSON.stringify(await measure()));
    await page.screenshot({ path: path.join(output, "layout-" + vp.w + ".png"), timeout: 60000 });
  }
  await browser.close();
  console.log("done");
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
