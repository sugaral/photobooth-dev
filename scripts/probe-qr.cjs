const { chromium } = require("playwright");
const base = "http://127.0.0.1:8000";
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
  // direct showQrCode test
  await page.evaluate((img) => window.photoBooth.showQrCode(img), IMG);
  await page.waitForTimeout(1500);
  const direct = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll(".modal .qr-dual-step img"));
    return { imgCount: imgs.length, loaded: imgs.map(i => i.complete && i.naturalWidth > 0), ssid: (document.querySelector(".qr-dual-ssid")||{}).textContent };
  });
  console.log("direct showQrCode:", JSON.stringify(direct));
  // close modal, then test deliverComposite
  await page.evaluate(() => { window.photoboothTools.modal.close(); });
  await page.evaluate(() => {
    window.__qrCb = null;
    window.photoBooth.deliverComposite("qr", f => { window.__qrCb = f; });
  });
  try {
    await page.waitForFunction(() => window.__qrCb !== null, { timeout: 20000 });
    console.log("deliverComposite callback file:", await page.evaluate(() => window.__qrCb));
  } catch (e) {
    const notif = await page.evaluate(() => Array.from(document.querySelectorAll(".toast, .notification, [class*=notif]")).map(n => n.textContent.trim()).filter(Boolean));
    console.log("deliverComposite timeout; notifications:", JSON.stringify(notif));
  }
  await browser.close();
  console.log("done");
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
