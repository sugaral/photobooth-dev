// Run with Playwright available through NODE_PATH. Does not alter saved settings or media.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.PHOTOBOOTH_TEST_URL || 'http://127.0.0.1:8000';
const output = path.resolve(__dirname, '../.runtime/screensaver-review');

(async () => {
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, hasTouch: true });
    const errors = [];
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    const active = '#screensaver-overlay.screensaver-overlay--active';
    const frame = '.screensaver-overlay__slide';
    const ready = page => page.waitForFunction(() => window.photoBooth && document.querySelector('.stage--start.stage--active'));
    const show = async page => {
        await page.evaluate(() => photoBooth.screensaver.show(true));
        await page.waitForSelector(active);
        await page.waitForFunction(() => document.getElementById('screensaver-overlay').getAttribute('aria-busy') !== 'true');
    };
    try {
        const response = await context.request.get(base + '/api/screensaverMedia.php');
        assert.equal(response.status(), 200);
        const { images } = await response.json();
        assert.ok(images.length >= 4, 'Provide at least four curated photos for this integration test');
        assert.deepEqual(images.slice(0, 4).map(photo => photo.name), ['1.jpg', '2.jpg', '3.jpg', '4.jpg']);
        const slides = await context.newPage();
        await slides.goto(base + '/?screensaverPreview=1', { waitUntil: 'networkidle' });
        await slides.waitForSelector(active);
        assert.ok((await slides.locator(frame).getAttribute('src')).includes('/1.jpg'));
        const rect = await slides.locator('.screensaver-overlay__viewport').boundingBox();
        assert.ok(Math.abs(rect.width / rect.height - 16 / 9) < 0.01);
        assert.equal(await slides.locator(frame).evaluate(el => getComputedStyle(el).objectFit), 'contain');
        await slides.screenshot({ path: path.join(output, 'desktop.png') });
        for (const filename of ['2.jpg', '3.jpg', '4.jpg', '1.jpg']) {
            await slides.waitForFunction(name => {
                const photos = document.querySelectorAll('.screensaver-overlay__slide');
                return photos.length === 1 && photos[0].src.includes('/' + name);
            }, filename, { timeout: 12000 });
        }
        // A waking touch must not activate the underlying photo-mode button.
        await slides.touchscreen.tap(500, 700);
        await slides.waitForSelector(active, { state: 'hidden' });
        assert.equal(await slides.locator('.stage--start.stage--active').count(), 1);
        await slides.waitForTimeout(650);
        await show(slides);
        await slides.keyboard.press('Enter');
        await slides.waitForSelector(active, { state: 'hidden' });
        await slides.waitForTimeout(650);
        await show(slides);
        await slides.keyboard.down('Enter');
        await slides.waitForTimeout(900);
        await slides.keyboard.down('Enter');
        await slides.keyboard.up('Enter');
        assert.equal(await slides.locator('.stage--start.stage--active').count(), 1, 'Held waking key must not start capture');
        console.log('PASS: four-photo sequence, wraparound, 16:9, touch and keyboard wake');

        const timing = await context.newPage();
        await timing.goto(base, { waitUntil: 'networkidle' });
        await ready(timing);
        await timing.clock.install();
        await timing.evaluate(() => photoBooth.screensaver.resetTimer());
        await timing.clock.runFor(59999);
        assert.equal(await timing.locator(active).count(), 0);
        await timing.clock.runFor(1);
        await timing.waitForSelector(active);
        await timing.evaluate(() => photoBooth.screensaver.resetTimer());
        await timing.clock.runFor(30000);
        await timing.mouse.move(20, 20);
        await timing.clock.runFor(30001);
        assert.equal(await timing.locator(active).count(), 0, 'Activity restarts idle countdown');
        for (const id of ['quickSettingsModal', 'payGateModal', 'burstWorkbenchModal']) {
            await timing.evaluate(id => { document.getElementById(id).style.display = 'block'; photoBooth.screensaver.resetTimer(); }, id);
            await timing.clock.runFor(60000);
            assert.equal(await timing.locator(active).count(), 0, id + ' must block idle playback');
            await timing.evaluate(id => { document.getElementById(id).style.display = 'none'; }, id);
        }
        await timing.evaluate(() => { document.querySelector('.stage--start').classList.remove('stage--active'); photoBooth.screensaver.resetTimer(); });
        await timing.clock.runFor(60000);
        assert.equal(await timing.locator(active).count(), 0, 'No interruption outside homepage');
        console.log('PASS: idle threshold, activity reset, settings/payment/workbench/capture guards');

        const edge = await context.newPage();
        await edge.route('**/api/screensaverMedia.php', route => route.fulfill({ json: { images: [] } }));
        await edge.goto(base, { waitUntil: 'networkidle' });
        await ready(edge);
        await edge.evaluate(() => photoBooth.screensaver.show());
        await edge.waitForTimeout(200);
        assert.equal(await edge.locator(active).count(), 0, 'Empty playlist must not hide homepage');
        await show(edge);
        assert.ok((await edge.locator('#screensaver-text-center').innerText()).includes('没有'));
        await edge.unroute('**/api/screensaverMedia.php');
        await edge.route('**/api/screensaverMedia.php', route => route.fulfill({ json: { images: [images[0]] } }));
        await show(edge);
        await edge.waitForTimeout(9000);
        assert.equal(await edge.locator(frame).count(), 1, 'One-photo playlist remains stable');
        await edge.unroute('**/api/screensaverMedia.php');
        await edge.route('**/api/screensaverMedia.php', route => route.fulfill({ json: { images: [{ url: '/missing-screensaver-test.jpg' }, images[1]] } }));
        await show(edge);
        assert.ok((await edge.locator(frame).getAttribute('src')).includes('/2.jpg'), 'Broken media skipped');
        await edge.unroute('**/api/screensaverMedia.php');
        let release;
        const delayed = new Promise(resolve => { release = resolve; });
        await edge.route('**/api/screensaverMedia.php', async route => { await delayed; await route.fulfill({ json: { images } }).catch(() => {}); });
        await edge.evaluate(() => { photoBooth.screensaver.show(true); photoBooth.screensaver.resetTimer(); });
        release();
        await edge.waitForTimeout(300);
        assert.equal(await edge.locator(active).count(), 0, 'Late request cannot reopen screensaver');
        console.log('PASS: empty, single, broken image and cancelled request');

        const disabled = await context.newPage();
        await disabled.addInitScript(() => {
            let factory;
            Object.defineProperty(window, 'createScreensaver', {
                configurable: true,
                get() { return factory; },
                set(value) { factory = deps => value({ ...deps, screensaverEnabled: false }); }
            });
        });
        await disabled.goto(base + '/?screensaverPreview=1', { waitUntil: 'networkidle' });
        await disabled.waitForSelector(active);
        await disabled.touchscreen.tap(500, 500);
        await disabled.waitForSelector(active, { state: 'hidden' });
        console.log('PASS: preview can be dismissed even when automatic playback is disabled');

        const mobile = await context.newPage();
        await mobile.setViewportSize({ width: 390, height: 844 });
        await mobile.emulateMedia({ reducedMotion: 'reduce' });
        await mobile.goto(base + '/?screensaverPreview=1', { waitUntil: 'networkidle' });
        await mobile.waitForSelector(active);
        await mobile.screenshot({ path: path.join(output, 'mobile.png') });
        const mobileRect = await mobile.locator('.screensaver-overlay__viewport').boundingBox();
        assert.ok(mobileRect.width <= 390 && mobileRect.height <= 844);
        await mobile.waitForFunction(() => document.querySelector('.screensaver-overlay__slide')?.src.includes('/2.jpg'), { timeout: 12000 });
        assert.equal(await mobile.locator(frame).evaluate(el => el.getAnimations().length), 0);
        await mobile.touchscreen.tap(180, 400);
        await mobile.waitForSelector(active, { state: 'hidden' });

        const admin = await context.newPage();
        await admin.setViewportSize({ width: 1440, height: 1000 });
        await admin.goto(base + '/admin/upload/?folder=screensavers', { waitUntil: 'networkidle' });
        assert.equal(await admin.locator('#folder_name').inputValue(), 'private/screensavers');
        assert.equal(await admin.locator('section img').count(), images.length);
        await admin.screenshot({ path: path.join(output, 'upload-desktop.png') });
        await admin.setViewportSize({ width: 390, height: 844 });
        await admin.screenshot({ path: path.join(output, 'upload-mobile.png') });
        await admin.goto(base + '/admin/', { waitUntil: 'networkidle' });
        assert.equal(await admin.locator('#screensaver-photos-btn').count(), 1);
        assert.equal(await admin.locator('[name="screensaver[timeout_minutes]"]').inputValue(), '1');
        assert.equal(await admin.locator('[name="screensaver[switch_seconds]"]').inputValue(), '8');
        assert.deepEqual(errors, []);
        console.log('PASS: responsive layouts, reduced motion, admin upload/settings, no JavaScript errors');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
