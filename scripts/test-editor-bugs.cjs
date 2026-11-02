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

  // --- Bug 1: sticker resize ---
  await page.click("#btnClassicOpenStickers");
  await page.waitForTimeout(600);
  await page.locator("#stickerModal .sticker-grid .sticker-item").first().click();
  await page.waitForTimeout(500);
  const immediate = await page.evaluate(() => {
    const s = document.querySelector("#stickerCanvasOverlay .placed-sticker");
    const h = s && s.querySelector(".sticker-resize-btn");
    return {
      active: s ? s.classList.contains("is-active") : null,
      handleVisible: h ? getComputedStyle(h).display !== "none" : null
    };
  });
  console.log("CHECK sticker active immediately:", JSON.stringify(immediate));
  const sizeOf = () => page.evaluate(() => { const c = document.querySelector("#stickerCanvasOverlay .placed-sticker.is-active .placed-sticker-content"); const r = c.getBoundingClientRect(); return { font: getComputedStyle(c).fontSize, w: Math.round(r.width) }; });
  console.log("before drag:", JSON.stringify(await sizeOf()));
  const handle = await page.locator("#stickerCanvasOverlay .placed-sticker.is-active .sticker-resize-btn").boundingBox();
  if (handle) {
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle.x + 150, handle.y + 150, { steps: 15 });
    await page.mouse.up();
  }
  await page.waitForTimeout(400);
  console.log("after drag:", JSON.stringify(await sizeOf()));
  await page.click("#btnStickerClose").catch(() => {});
  await page.waitForTimeout(300);

  // --- Bug 3: virtual keyboard in text drawer ---
  await page.click("#btnClassicInsertText");
  await page.waitForTimeout(600);
  const kbInfo = await page.evaluate(() => {
    const kb = document.querySelector("#textKeyboardContainer #virtual-keyboard");
    return {
      exists: !!kb,
      rows: kb ? kb.querySelectorAll(".keyboard-row").length : 0,
      keys: kb ? kb.querySelectorAll(".keyboard-button").length : 0,
      visible: kb ? kb.getBoundingClientRect().width > 0 : false
    };
  });
  console.log("CHECK keyboard:", JSON.stringify(kbInfo));
  // type via virtual keys: clear then type "HI"
  await page.locator("#textKeyboardContainer .keyboard-button--clear").click();
  await page.waitForTimeout(150);
  const keys = await page.locator("#textKeyboardContainer .keyboard-button", { hasText: /^[A-Z]$/ }).all();
  const val0 = await page.inputValue("#textDrawerInput");
  console.log("input after clear:", JSON.stringify(val0));
  for (const k of ["h", "i"]) {
    await page.locator("#textKeyboardContainer .keyboard-button", { hasText: new RegExp("^" + k + "$") }).first().click();
    await page.waitForTimeout(120);
  }
  const val1 = await page.inputValue("#textDrawerInput");
  console.log("input after typing:", JSON.stringify(val1));
  // place text on photo
  await page.click("#btnTextAddOnPhoto");
  await page.waitForTimeout(500);
  const textSticker = await page.evaluate(() => {
    const t = document.querySelector("#stickerCanvasOverlay .placed-sticker--text");
    return t ? { text: t.textContent.trim(), active: t.classList.contains("is-active") } : null;
  });
  console.log("CHECK text sticker:", JSON.stringify(textSticker));
  // close drawer, then dblclick the text sticker to reopen
  await page.click("#btnTextClose").catch(() => {});
  await page.waitForTimeout(400);
  const tpos = await page.evaluate(() => {
    const t = document.querySelector("#stickerCanvasOverlay .placed-sticker--text");
    const r = t.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(tpos.x, tpos.y, { clickCount: 2 });
  await page.waitForTimeout(600);
  const drawerOpen = await page.evaluate(() => {
    const m = document.querySelector("#textModal");
    return m && m.style.display !== "none" && m.getBoundingClientRect().height > 0;
  });
  console.log("CHECK dblclick opens text drawer:", drawerOpen);
  await page.screenshot({ path: path.join(output, "text-keyboard.png"), timeout: 60000 });
  await browser.close();
  console.log("done");
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
