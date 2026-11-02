// Regression: moving the pointer while loading must not cancel manual standby.
// Uses saved screensaver media/settings without modifying them.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.PHOTOBOOTH_TEST_URL || 'http://127.0.0.1:8000';

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    const active = page.locator('#screensaver-overlay.screensaver-overlay--active');
    const button = page.locator('#btnEnterStandby');
    const loaded = () => page.waitForFunction(() => document.querySelector('.screensaver-overlay--active .screensaver-overlay__slide')?.complete);
    try {
        await page.goto(base, { waitUntil: 'networkidle' });
        assert.equal(await page.evaluate(() => config.screensaver.timeout_minutes), 1);
        let release;
        let pending = new Promise(resolve => { release = resolve; });
        await page.route('**/api/screensaverMedia.php', async route => {
            await pending;
            await route.continue().catch(() => {});
        });
        await button.click();
        await active.waitFor();
        assert.equal(await active.getAttribute('aria-busy'), 'true');
        await page.mouse.move(500, 400);
        await page.waitForTimeout(800);
        assert.equal(await active.count(), 1, 'Mouse movement cannot cancel manual entry while media loads');
        release();
        await loaded();
        assert.equal(await active.getAttribute('aria-busy'), null);
        await page.mouse.click(500, 400);
        await active.waitFor({ state: 'hidden' });
        assert.equal(await button.evaluate(node => node === document.activeElement), true, 'Wake returns focus to the entry button');

        await page.waitForTimeout(700);
        pending = new Promise(resolve => { release = resolve; });
        await button.click();
        await active.waitFor();
        await page.mouse.click(500, 400);
        await active.waitFor({ state: 'hidden' });
        release();
        await page.waitForTimeout(900);
        assert.equal(await active.count(), 0, 'A late playlist response must not reopen a cancelled screensaver');
        await page.unroute('**/api/screensaverMedia.php');

        for (const key of ['Enter', 'Space']) {
            await button.focus();
            await page.keyboard.press(key);
            await loaded();
            await page.waitForTimeout(700);
            assert.equal(await active.count(), 1, 'Opening key release must not wake standby');
            await page.keyboard.press('Escape');
            await active.waitFor({ state: 'hidden' });
            await page.waitForTimeout(700);
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await button.tap();
        await loaded();
        await page.touchscreen.tap(180, 300);
        await active.waitFor({ state: 'hidden' });
        assert.equal(await page.locator('.stage--start.stage--active').count(), 1);
        await page.waitForTimeout(700);
        await page.clock.install();
        await page.evaluate(() => photoBooth.screensaver.resetTimer());
        await page.clock.runFor(59999);
        assert.equal(await active.count(), 0);
        await page.clock.runFor(1);
        await loaded();
        assert.deepEqual(errors, []);
        console.log('PASS delayed manual entry + mousemove, loading cancellation, focus restoration, keyboard/touch, 60-second automatic standby');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
