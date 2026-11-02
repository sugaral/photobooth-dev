// NODE_PATH must point to the bundled Playwright packages. Uses a synthetic camera, never the user's camera.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const base = process.env.PHOTOBOOTH_TEST_URL || 'http://127.0.0.1:8000';
const out = path.resolve(__dirname, '../.runtime/workshop-review');
fs.mkdirSync(out, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['camera'] });
    const errors = [];
    const files = new Set();
    const captures = [];
    const exports = [];
    const responses = [];
    context.on('page', page => {
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
            if (/\/api\/(capture|createWorkshop)\.php/.test(response.url())) {
                responses.push((async () => {
                    const data = await response.json().catch(() => ({}));
                    if (data.file) files.add(data.file);
                    if (data.capture_token) captures.push(data);
                    if (data.layout) exports.push(data);
                })());
            }
        });
    });
    await context.route('**/*', route => {
        const url = route.request().url();
        if (!url.startsWith(base)) return route.abort();
        if (url.includes('/api/checkNetwork.php')) return route.fulfill({ json: { online: true } });
        return route.continue();
    });
    try {
        await context.addInitScript(() => {
            window.workshopAudioLog = [];
            window.workshopPlayedAudio = [];
            const play = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function () {
                if (this.tagName === 'AUDIO' && /counter-/.test(this.src)) {
                    window.workshopAudioLog.push(this.src.match(/counter-(\d+)/)[1]);
                }
                const result = play.call(this);
                if (this.tagName === 'AUDIO' && /counter-/.test(this.src)) {
                    const count = this.src.match(/counter-(\d+)/)[1];
                    result.then(() => window.workshopPlayedAudio.push(count), () => {});
                }
                return result;
            };
        });
        const page = await context.newPage();
        const startSeries = async () => {
            if (await page.locator('#workshopNotice').evaluate(node => node.open)) await page.locator('#workshopStart').click();
            await page.waitForFunction(() => !document.getElementById('btnStudioDoneCapture').disabled);
            await page.locator('#btnStudioDoneCapture').click();
        };
        await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => window.creativeWorkshop && window.photoBooth);
        if (!process.env.WORKSHOP_NEWSPAPER_ONLY) {
        await page.screenshot({ path: path.join(out, 'home-desktop.png') });
        await page.locator('#btnWorkshopStart').click();
        assert.equal(await page.locator('.workshop__layout').count(), 8);
        await page.screenshot({ path: path.join(out, 'desktop.png') });
        await page.locator('#workshopChoose').click();
        await page.waitForFunction(() => !document.getElementById('btnStudioDoneCapture').disabled);
        assert.match(await page.locator('#workshopNoticeTitle').innerText(), /连续拍 4 次/);
        await page.screenshot({ path: path.join(out, 'notice-desktop.png') });
        await page.locator('#workshopStart').click();
        assert.equal(await page.locator('#creativeWorkshop #studioStage').count(), 1, 'Workshop reuses the original studio');
        assert.equal(await page.locator('#studioStage').count(), 1, 'No duplicate studio controls');
        assert.equal(await page.locator('#paneFilters').isVisible(), true);
        await page.locator('.wb-preset-pill[data-preset="rosy"]').click();
        assert.equal(await page.locator('#studioRosySlider').inputValue(), '45');
        assert.match(await page.locator('#valStudioRosy').innerText(), /45%/);
        await page.locator('#btnResetStudioBeauty').click();
        await page.locator('.wb-filter-item[data-filter="grayscale"]').click();
        assert.match(await page.locator('#preview--video').evaluate(node => getComputedStyle(node).filter), /grayscale/);
        const beforeMirror = await page.locator('#preview--video').evaluate(node => node.classList.contains('flip-horizontal'));
        await page.locator('#btnStudioFlip').click();
        assert.equal(await page.locator('#preview--video').evaluate(node => node.classList.contains('flip-horizontal')), !beforeMirror);
        await page.locator('#btnStudioFlip').click();
        await page.locator('#tabBtnTemplates').click();
        assert.equal(await page.locator('#studioClassicTplGrid').isVisible(), true);
        await page.locator('#tabBtnFilters').click();
        await page.screenshot({ path: path.join(out, 'shared-studio-desktop.png') });

        await page.evaluate(() => {
            window.workshopCountdownLog = [];
            new MutationObserver(() => {
                const el = document.getElementById('workshopCountdown');
                if (!el.hidden) window.workshopCountdownLog.push({ value: el.textContent, at: performance.now() });
            }).observe(document.getElementById('workshopCountdown'), { childList: true, attributes: true, attributeFilter: ['hidden'] });
        });
        await startSeries();
        await page.waitForFunction(() => document.getElementById('workshopCountdown').textContent === '2');
        await page.screenshot({ path: path.join(out, 'capture-desktop.png') });
        await page.waitForFunction(() => document.querySelector('.stage--result.stage--active')?.getAttribute('data-img')?.startsWith('workshop_'), null, { timeout: 60000 });
        await Promise.all(responses);
        assert.equal(captures.length, 4, 'Exactly four actual captures, not six shots or repeated stills');
        assert.equal(new Set(captures.map(c => c.capture_token)).size, 4);
        const log = await page.evaluate(() => window.workshopCountdownLog);
        assert.deepEqual(log.map(entry => entry.value), ['3','2','1','3','2','1','3','2','1','3','2','1']);
        assert.deepEqual(await page.evaluate(() => window.workshopAudioLog), ['3','2','1','3','2','1','3','2','1','3','2','1'], 'Every shot speaks its own countdown');
        assert.deepEqual(await page.evaluate(() => window.workshopPlayedAudio), ['3','2','1','3','2','1','3','2','1','3','2','1'], 'Countdown audio really starts playing');
        assert.equal(await page.locator('#studioStage').count(), 1);
        assert.equal(await page.locator('#creativeWorkshop #studioStage').count(), 0, 'Shared studio restored after export');
        for (let i = 0; i < log.length; i++) if (i % 3 !== 2) assert.ok(log[i+1].at-log[i].at >= 900, 'Each countdown number stays visible for a second');
        assert.equal(exports[0].width, 1200);
        assert.equal(exports[0].height, 1800);
        assert.match(await page.locator('#lblResultPaperTitle').innerText(), /创意工坊/);
        await page.screenshot({ path: path.join(out, 'result-desktop.png') });
        fs.copyFileSync(path.join(__dirname, '../data/images', exports[0].file), path.join(out, 'finished-photo.jpg'));
        const colorCheck = spawnSync(path.resolve(__dirname, '../.runtime/php/php.exe'), ['-r', '$im=imagecreatefromjpeg($argv[1]); for($y=100;$y<1750;$y+=80)for($x=80;$x<1150;$x+=80){$v=imagecolorat($im,$x,$y);$r=($v>>16)&255;$g=($v>>8)&255;$b=$v&255;if(max($r,$g,$b)-min($r,$g,$b)>4)exit(1);} echo "grayscale exported";', path.join(out, 'finished-photo.jpg')], {encoding:'utf8'});
        assert.equal(colorCheck.status, 0, 'Selected filter must be baked into every saved tile');

        const csrf = await (await context.request.get(base + '/api/csrf.php')).json();
        const payload = { layout: 'grid4', csrf: csrf.token };
        captures.forEach((capture, index) => payload[`tokens[${index}]`] = capture.capture_token);
        const repeated = await (await context.request.post(base + '/api/createWorkshop.php', { form: payload })).json();
        assert.equal(repeated.file, exports[0].file, 'Retry returns same saved file');
        const denied = await context.request.post(base + '/api/createWorkshop.php', { form: { ...payload, csrf: 'bad' } });
        assert.equal(denied.status(), 403);
        const badLayout = await context.request.post(base + '/api/createWorkshop.php', { form: { ...payload, layout: 'unknown' } });
        assert.equal(badLayout.status(), 400);
        const incomplete = await context.request.post(base + '/api/createWorkshop.php', { form: { layout: 'grid4', csrf: csrf.token, 'tokens[0]': captures[0].capture_token } });
        assert.equal(incomplete.status(), 400);
        const forged = { ...payload, 'tokens[0]': 'f'.repeat(48) };
        assert.equal((await context.request.post(base + '/api/createWorkshop.php', { form: forged })).status(), 422);
        console.log('PASS four real captures with four 3-2-1 countdowns, editor, saved photo, CSRF, invalid layout/count/token, idempotent retry');

        await page.locator('.stage--result .newpic').first().click();
        await page.waitForSelector('#workshopSelection:not([hidden])');
        await page.locator('[data-layout="duo"]').click();
        await page.locator('#workshopChoose').click();
        await page.waitForFunction(() => !document.getElementById('btnStudioDoneCapture').disabled);
        assert.match(await page.locator('#workshopNoticeTitle').innerText(), /连续拍 2 次/);
        const audioBeforeCancel = await page.evaluate(() => window.workshopAudioLog.length);
        // Cancel before the first shutter; stale countdowns must never create a photo.
        await startSeries();
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#btnStudioBack').click();
        await page.waitForTimeout(3400);
        assert.equal(captures.length, 4, 'Cancelled countdown must not capture');
        assert.equal(await page.evaluate(() => window.workshopAudioLog.length), audioBeforeCancel + 1, 'Cancellation stops pending countdown sounds');
        await page.locator('#workshopChoose').click();
        await page.waitForFunction(() => !document.getElementById('btnStudioDoneCapture').disabled);
        let failedOnce = false;
        await page.route('**/api/capture.php', route => {
            if (!failedOnce) { failedOnce = true; return route.fulfill({ json: { error: '测试：拍摄失败，请继续' } }); }
            return route.continue();
        });
        await startSeries();
        await page.waitForSelector('#workshopRetry:not([hidden])');
        await page.locator('#workshopRetry').click();
        await page.waitForFunction(() => document.querySelector('.stage--result.stage--active')?.getAttribute('data-img')?.startsWith('workshop_'), null, { timeout: 60000 });
        await Promise.all(responses);
        assert.equal(captures.length, 6, 'Two-photo layout completes with exactly two successful captures after retry');
        assert.equal(exports.at(-1).layout, 'duo');
        console.log('PASS result retake returns to workshop, two-photo layout, cancellation, capture failure and resume');

        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => photoBooth.init());
        await page.screenshot({ path: path.join(out, 'home-mobile.png'), fullPage: true });
        await page.locator('#btnWorkshopStart').click();
        await page.screenshot({ path: path.join(out, 'mobile.png'), fullPage: true });
        const overflow = await page.locator('#creativeWorkshop').evaluate(node => node.scrollWidth > node.clientWidth + 1);
        assert.equal(overflow, false, 'Workshop must not overflow horizontally on mobile');
        await page.locator('[data-layout="grid6"]').click();
        await page.locator('#workshopChoose').click();
        await page.waitForFunction(() => !document.getElementById('btnStudioDoneCapture').disabled);
        assert.match(await page.locator('#workshopNoticeTitle').innerText(), /连续拍 6 次/);
        await page.screenshot({ path: path.join(out, 'notice-mobile.png') });
        await page.locator('#workshopStart').click();
        await page.screenshot({ path: path.join(out, 'shared-studio-mobile.png') });
        const studioOverflow = await page.locator('#studioStage').evaluate(node => node.scrollWidth > node.clientWidth + 1);
        assert.equal(studioOverflow, false, 'Shared studio must fit a mobile screen');
        await page.locator('#studioCountdownSelect').selectOption('2');
        const beforeSixSounds = await page.evaluate(() => window.workshopPlayedAudio.length);

        await startSeries();
        await page.screenshot({ path: path.join(out, 'capture-mobile.png') });
        await page.waitForFunction(() => document.querySelector('.stage--result.stage--active')?.getAttribute('data-img')?.startsWith('workshop_'), null, { timeout: 90000 });
        await Promise.all(responses);
        assert.equal(captures.length, 12);
        assert.equal(exports.at(-1).layout, 'grid6');
        assert.deepEqual(await page.evaluate(start => window.workshopPlayedAudio.slice(start), beforeSixSounds), ['2','1','2','1','2','1','2','1','2','1','2','1'], 'Selected countdown length applies to every shot');
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.evaluate(() => photoBooth.init());
        await page.locator('#btnClassicStart').click();
        assert.equal(await page.locator('#studioStage.stage--active').count(), 1);
        assert.match(await page.locator('#workbenchTitle').innerText(), /经典美颜/);
        assert.equal(await page.locator('#btnStudioDoneCapture').isEnabled(), true);
        await page.locator('#btnStudioBack').click();
        await page.locator('#btnEnterAiMode').click();
        assert.match(await page.locator('#workbenchTitle').innerText(), /AI/);
        assert.deepEqual(errors, [], 'No browser runtime exceptions');
        console.log('PASS six-photo template, mobile layout and no browser errors');

        await page.locator('#btnStudioBack').click();
        }
        await page.locator('#btnWorkshopStart').click();
        await page.locator('[data-layout="hainan_daily"]').click();
        assert.equal(await page.locator('#workshopSelectedName').innerText(), '海南日报');
        assert.match(await page.locator('#workshopSelectedSpec').innerText(), /3600 × 5143/);
        const preview = await page.locator('#workshopSelectedPaper').evaluate(async node => {
            const src = getComputedStyle(node).backgroundImage.match(/url\("?([^"\)]+)/)[1];
            const image = new Image(); image.src = src; await image.decode();
            return { ratio: node.clientWidth / node.clientHeight, imageWidth: image.naturalWidth,
                cells: [...node.children].map(cell => [cell.style.left, cell.style.top]) };
        });
        assert.ok(Math.abs(preview.ratio - 3600/5143) < .005);
        assert.equal(preview.imageWidth, 1000);
        assert.equal(preview.cells.length, 3);
        await page.screenshot({ path: path.join(out, 'hainan-selection.png'), fullPage: true });
        await page.locator('#workshopChoose').click();
        assert.match(await page.locator('#workshopNoticeTitle').innerText(), /连续拍 3 次/);
        await page.locator('#workshopStart').click();
        await page.waitForFunction(() => !document.getElementById('btnStudioDoneCapture').disabled);
        assert.equal(await page.locator('#studioSmoothSlider').isVisible(), true);
        await page.locator('#studioCountdownSelect').selectOption('3');
        await page.locator('.wb-filter-item[data-filter="plain"]').click();
        const beforeNewspaperSounds = await page.evaluate(() => window.workshopPlayedAudio.length);
        const beforeNewspaperCaptures = captures.length;
        await page.screenshot({ path: path.join(out, 'hainan-studio.png') });
        await startSeries();
        await page.waitForFunction(() => window.creativeWorkshop.resultLayout?.id === 'hainan_daily' &&
            document.querySelector('.stage--result.stage--active')?.getAttribute('data-img')?.startsWith('workshop_'), null, { timeout: 90000 });
        await Promise.all(responses);
        assert.equal(captures.length - beforeNewspaperCaptures, 3);
        assert.equal(new Set(captures.slice(-3).map(c => c.capture_token)).size, 3);
        assert.deepEqual(await page.evaluate(start => window.workshopPlayedAudio.slice(start), beforeNewspaperSounds), ['3','2','1','3','2','1','3','2','1']);
        const newspaper = exports.at(-1);
        assert.equal(newspaper.layout, 'hainan_daily');
        assert.deepEqual([newspaper.width, newspaper.height, newspaper.dpi], [3600, 5143, 300]);
        assert.match(await page.locator('#lblResultPaperDetail').innerText(), /3600 × 5143/);
        fs.copyFileSync(path.join(__dirname, '../data/images', newspaper.file), path.join(out, 'hainan-finished.jpg'));
        await page.locator('.stage--result').evaluate(async node => {
            const source = getComputedStyle(node, '::after').backgroundImage.match(/url\("?([^"\)]+)/)[1];
            const image = new Image(); image.src = source; await image.decode();
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        await page.screenshot({ path: path.join(out, 'hainan-result.png') });
        await page.locator('#btnCommercialPrintPreview').click();
        assert.match(await page.locator('#printSpecResolution').innerText(), /3600 × 5143/);
        assert.match(await page.locator('#printSpecDimension').innerText(), /原版报纸比例/);
        await page.locator('#btnCommercialPrintClose').click();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('.stage--result .newpic').first().click();
        await page.waitForSelector('#workshopSelection:not([hidden])');
        assert.equal(await page.locator('[data-layout="hainan_daily"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#creativeWorkshop').evaluate(node => node.scrollWidth > node.clientWidth + 1), false);
        await page.screenshot({ path: path.join(out, 'hainan-mobile.png'), fullPage: true });
        assert.deepEqual(errors, []);
        console.log('PASS newspaper preview, three distinct captures and spoken countdowns, shared beauty, original-ratio high-resolution export and print labels');
    } finally {
        await Promise.allSettled(responses);
        await browser.close();
        // Remove only the exact files produced by this test session from the gallery and temp directory.
        const php = path.resolve(__dirname, '../.runtime/php/php.exe');
        const cleanup = spawnSync(php, ['-r', `require 'lib/boot.php'; $db=Photobooth\\Service\\DatabaseManagerService::getInstance(); foreach(array_slice($argv,1) as $file){ if(!preg_match('/^[a-zA-Z0-9_-]+\\.jpg$/D',$file))continue; $db->deleteContentFromDB($file); foreach(['data/images','data/thumbs','data/tmp'] as $folder){$p=$folder.'/'.$file;if(is_file($p))unlink($p);}}`, ...files], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' });
        if (cleanup.status !== 0) console.error('Test photo cleanup failed:', cleanup.stderr);
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
