const path = require("node:path");
const fs = require("node:fs");
const { chromium, devices } = require("playwright");
const base = "http://127.0.0.1:8000";
const output = path.resolve(__dirname, "../.runtime/editor-bugs");
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const mob = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  await mob.goto(base + "/photo.php?image=20261021_155718.jpg", { waitUntil: "networkidle" });
  await mob.screenshot({ path: path.join(output, "qr-landing-mobile.png"), timeout: 60000 });
  await mob.goto(base + "/photo.php?image=notexist.jpg", { waitUntil: "domcontentloaded" });
  await mob.screenshot({ path: path.join(output, "qr-landing-404.png"), timeout: 60000 });
  await browser.close();
  console.log("done");
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
