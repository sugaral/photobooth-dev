/* global config, environment, photoboothTools, photoboothPreview, photoBooth */
// Independent capture session: one countdown and one real capture for each layout cell.
(function () {
    'use strict';
    const root = document.getElementById('creativeWorkshop');
    if (!root) return;
    const el = id => document.getElementById(id);
    const catalog = JSON.parse(el('workshopCatalog').textContent);
    const previewVideo = document.getElementById('preview--video');
    const beautyCanvas = document.getElementById('preview--beauty-canvas');
    const previewContainer = document.getElementById('preview--video-container');
    const previewOriginalParent = previewContainer?.parentElement;
    const previewOriginalNextSibling = previewContainer?.nextSibling;
    const previewSlot = document.getElementById('workshopPreviewSlot');
    const notice = el('workshopNotice');
    const studio = el('studioStage');
    const studioAnchor = document.createComment('shared studio position');
    studio.before(studioAnchor);
    const captureTools = ['workshopPreviewSlot', 'workshopCropGuide', 'workshopCountdown', 'workshopFlash', 'workshopProgress'];
    const countdownSounds = new Map();
    let audioReady = false;
    let countdownSeconds = 3;
    let backgroundTemplate = '';
    let sharedStudioMounted = false;

    function stopCountdownAudio() {
        countdownSounds.forEach(audio => { audio.pause(); audio.currentTime = 0; });
    }

    async function prepareAudio(id) {
        audioReady = false;
        syncCaptureButton();
        if (config.sound.enabled && config.sound.countdown_enabled) {
            if (!photoboothTools.sounds) {
                const response = await fetch(`${environment.publicFolders.api}/sounds.php`, { cache: 'no-store' });
                if (!response.ok) throw new Error('倒数语音加载失败，请重试。');
                photoboothTools.sounds = await response.json();
            }
            check(id);
            await Promise.all(Array.from({ length: 10 }, async (_, index) => {
                const count = index + 1;
                const sound = photoboothTools.getSound(`counter-${count}`);
                if (!sound) throw new Error('倒数语音缺失，请检查声音设置后重试。');
                if (countdownSounds.get(count)?.readyState >= 3) return;
                const audio = new Audio();
                audio.preload = 'auto';
                countdownSounds.set(count, audio);
                await new Promise((resolve, reject) => {
                    const finish = error => {
                        clearTimeout(timer);
                        audio.oncanplaythrough = audio.onerror = null;
                        if (error) reject(new Error('倒数语音加载失败，请重试。'));
                        else resolve();
                    };
                    const timer = setTimeout(() => finish(true), 15000);
                    audio.oncanplaythrough = () => finish(false);
                    audio.onerror = () => finish(true);
                    audio.src = sound;
                    audio.load();
                });
            }));
        }
        check(id);
        audioReady = true;
        syncCaptureButton();
    }

    function playCountdown(count) {
        if (!config.sound.enabled || !config.sound.countdown_enabled) return;
        stopCountdownAudio();
        const audio = countdownSounds.get(count);
        if (audio) audio.play().catch(error => photoboothTools.console.log('Countdown audio: ' + error.message));
    }

    function syncCaptureButton() {
        el('btnStudioDoneCapture').disabled = running || !cameraReady || !audioReady;
        el('btnStudioDoneCapture').querySelector('.wb-capture-text').textContent = running ? '正在连续拍摄…' : `完成 · 开始 ${layout.cells.length} 连拍`;
        // Freeze settings throughout a series; retry retains the selected look.
        const hasStarted = running || photos.length > 0;
        el('studioWorkbench').querySelector('.workbench-body').inert = hasStarted;
        el('studioCountdownSelect').disabled = hasStarted;
        el('btnStudioFlip').disabled = hasStarted;
    }

    function mountStudio() {
        el('workshopCapture').append(studio);
        root.classList.add('is-capturing');
        sharedStudioMounted = true;
        window.studioClassicLayout = 'single';
        photoBooth.enterStudio('classic', { workshop: true });
        el('workbenchTitle').textContent = '创意工坊拍摄工作室';
        el('workbenchSubtitle').textContent = '自然微调美颜 · 滤镜与背景 · 创意拼图';
        el('studioModePillText').textContent = `创意工坊 · ${layout.name}`;
        el('studioPaperGuide').style.display = 'none';
        el('btnStudioBack').querySelector('span').textContent = '返回选模板';
        el('tabBtnFilters').click();
        ['workshopPreviewSlot', 'workshopCropGuide', 'workshopCountdown', 'workshopFlash'].forEach(id => el('studioViewport').append(el(id)));
        el('studioWorkbench').querySelector('.workbench-header').after(el('workshopProgress'));
        syncCaptureButton();
    }

    function restoreStudio() {
        if (!sharedStudioMounted) return;
        photoBooth.stopStudioPoseCarousel();
        captureTools.forEach(id => el('workshopCaptureTools').append(el(id)));
        studioAnchor.after(studio);
        studio.classList.remove('stage--active');
        document.body.classList.remove('mode--studio');
        root.classList.remove('is-capturing');
        el('btnStudioBack').querySelector('span').textContent = '返回首页';
        el('btnStudioDoneCapture').disabled = false;
        el('btnStudioDoneCapture').querySelector('.wb-capture-text').textContent = '完成 · 开始拍照';
        el('studioWorkbench').querySelector('.workbench-body').inert = false;
        el('studioCountdownSelect').disabled = false;
        el('btnStudioFlip').disabled = false;
        sharedStudioMounted = false;
    }

    function back() {
        if (!running || window.confirm('返回选模板会结束本轮拍摄，确定返回吗？')) selection();
    }
    let layout = catalog.layouts[0];
    let photos = [];
    let active = false;
    let running = false;
    let generation = 0;
    let request = null;
    let cameraStream = null;
    let ownsCamera = false;
    let cameraReady = false;
    let retryAction = null;
    let resultLayout = null;
    const commandCapture = () => config.preview.mode !== 'device_cam' || config.dev.demo_images;
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const check = id => {
        if (!active || id !== generation) throw new Error('WORKSHOP_CANCELLED');
        if (document.hidden) throw new Error('拍摄已暂停。回到页面后，点击继续拍摄。');
    };

    function paper(container, selected, shots = [], current = -1) {
        container.replaceChildren();
        const width = selected.width || catalog.width;
        const height = selected.height || catalog.height;
        container.style.aspectRatio = `${width} / ${height}`;
        container.style.backgroundImage = selected.preview ? `url("${selected.preview}")` : 'none';
        container.style.backgroundSize = '100% 100%';
        selected.cells.forEach((cellData, index) => {
            const [x, y, w, h, shape, points] = cellData;
            const cell = document.createElement('span');
            cell.className = 'workshop__cell' + (index === current ? ' is-current' : '');
            Object.assign(cell.style, {
                left: `${x / width * 100}%`, top: `${y / height * 100}%`,
                width: `${w / width * 100}%`, height: `${h / height * 100}%`
            });
            if (shape === 'polygon' && Array.isArray(points)) cell.style.clipPath = `polygon(${points.map(([px, py]) => `${px}% ${py}%`).join(',')})`;
            if (shots[index]) {
                const image = document.createElement('img');
                image.src = shots[index].url;
                image.alt = `第 ${index + 1} 张照片`;
                cell.append(image);
            } else {
                cell.textContent = index + 1;
                cell.setAttribute('aria-label', `第 ${index + 1} 张${index === current ? '，正在拍摄' : '，待拍摄'}`);
            }
            container.append(cell);
        });
    }

    function select(id) {
        layout = catalog.layouts.find(item => item.id === id) || catalog.layouts[0];
        el('workshopLayouts').querySelectorAll('button').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.layout === layout.id));
        });
        paper(el('workshopSelectedPaper'), layout);
        el('workshopSelectedName').textContent = layout.name;
        el('workshopSelectedSpec').textContent = layout.spec || '6 寸竖版 · 1200 × 1800 像素 · 300 DPI';
        el('workshopSelectedDescription').textContent = `${layout.description} 连续拍 ${layout.cells.length} 张。`;
    }

    function stopCamera() {
        if (typeof photoBooth.stopFacePoseAlignmentLoop === 'function') photoBooth.stopFacePoseAlignmentLoop();
        if (previewContainer && previewOriginalParent) {
            if (previewOriginalNextSibling && previewOriginalNextSibling.parentNode === previewOriginalParent) previewOriginalParent.insertBefore(previewContainer, previewOriginalNextSibling);
            else previewOriginalParent.appendChild(previewContainer);
            $(previewContainer).hide();
        }
        if (ownsCamera && cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            if (previewVideo) {
                previewVideo.pause();
                previewVideo.srcObject = null;
            }
        }
        cameraStream = null;
        ownsCamera = false;
        cameraReady = false;
    }

    function cancelSession() {
        generation++;
        running = false;
        if (request) request.abort();
        request = null;
        if (notice.open) notice.close();
        stopCountdownAudio();
        stopCamera();
        restoreStudio();
        photos = [];
        el('workshopCountdown').hidden = true;
        el('workshopFlash').hidden = true;
        el('workshopRetry').hidden = true;
    }

    function status(text, error = false) {
        el('workshopStatus').textContent = text;
        el('workshopStatus').classList.toggle('is-error', error);
    }

    function fitViewfinder() {
        if (!sharedStudioMounted) return;
        const cell = layout.cells[Math.min(photos.length, layout.cells.length - 1)];
        const viewport = el('studioViewport');
        // The full-size live view stays identical to the studio. A frame marks
        // the center crop that this particular polygon/rectangle will use.
        const sourceWidth = previewVideo.videoWidth || 4;
        const sourceHeight = previewVideo.videoHeight || 3;
        const viewScale = Math.max(viewport.clientWidth / sourceWidth, viewport.clientHeight / sourceHeight);
        const cropScale = Math.max(cell[2] / sourceWidth, cell[3] / sourceHeight);
        Object.assign(el('workshopCropGuide').style, {
            width: `${cell[2] / cropScale * viewScale}px`, height: `${cell[3] / cropScale * viewScale}px`
        });
    }

    async function prepareCamera(id) {
        cameraReady = false;
        syncCaptureButton();
        el('workshopCameraStatus').textContent = '正在准备摄像头，请允许浏览器使用摄像头。';
        status('正在准备摄像头…');
        // The capture API retains support for configured command cameras. This view needs a live device preview.
        if (commandCapture()) {
            cameraReady = true;
            syncCaptureButton();
            el('workshopCameraStatus').textContent = config.dev.demo_images ? '当前为演示模式，准备使用演示照片。' : '已使用系统配置的相机，准备开始连拍。';
            status(config.dev.demo_images ? '演示模式已就绪。' : '每张照片前都会倒数 3、2、1。');
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('浏览器无法使用摄像头，请在本机 localhost 或 HTTPS 页面打开。');
        // Reuse the project's existing preview node and beauty pipeline so camera choice,
        // framing, mirror direction and WebGL retouching stay identical to normal capture.
        if (previewContainer && previewSlot) previewSlot.appendChild(previewContainer);
        $(previewContainer).show();
        const preferred = await photoboothPreview.resolveTargetDeviceId();
        check(id);
        const constraints = preferred ? { deviceId: { exact: preferred } } : { facingMode: config.preview.camera_mode || 'user' };
        const incoming = await navigator.mediaDevices.getUserMedia({ audio: false, video: constraints });
        if (!active || id !== generation) {
            incoming.getTracks().forEach(track => track.stop());
            return;
        }
        cameraStream = incoming;
        ownsCamera = true;
        previewVideo.srcObject = cameraStream;
        await previewVideo.play();
        if (typeof photoBooth.startFacePoseAlignmentLoop === 'function') photoBooth.startFacePoseAlignmentLoop();
        for (let attempt = 0; (!cameraStream?.active || !previewVideo.videoWidth || previewVideo.readyState < 2) && attempt < 100; attempt++) {
            await wait(100);
            check(id);
        }
        check(id);
        if (!cameraStream?.active || !previewVideo.videoWidth || previewVideo.readyState < 2) throw new Error('摄像头还没有画面，请检查连接后重试。');
        cameraReady = true;
        syncCaptureButton();
        fitViewfinder();
        el('workshopCameraStatus').textContent = '摄像头已就绪 · 与普通拍照使用同一套美颜与镜像设置';
        status('对准取景框，准备好后开始连拍。');
    }

    function fail(error, retry) {
        generation++;
        running = false;
        stopCountdownAudio();
        stopCamera();
        syncCaptureButton();
        el('workshopCountdown').hidden = true;
        el('workshopFlash').hidden = true;
        if (!active || error.message === 'WORKSHOP_CANCELLED') return;
        const messages = {
            NotAllowedError: '摄像头权限未开启，请在浏览器地址栏允许使用摄像头后重试。',
            NotFoundError: '没有找到摄像头，请连接摄像头后重试。',
            NotReadableError: '摄像头被占用或无法读取，请关闭其他使用摄像头的软件后重试。',
            OverconstrainedError: '已选摄像头不可用，请在首页设置中重新选择摄像头。'
        };
        const message = messages[error.name] || error.message || '操作失败，请重试。';
        status(message, true);
        if (notice.open) notice.close();
        retryAction = retry;
        el('workshopRetry').textContent = photos.length === layout.cells.length ? '重新生成成片' : photos.length ? '继续拍摄' : '重新准备摄像头';
        el('workshopRetry').hidden = false;
    }

    async function enterCapture() {
        cancelSession();
        const id = generation;
        el('workshopSelection').hidden = true;
        el('workshopCapture').hidden = false;
        el('workshopBack').querySelector('span').textContent = '返回选模板';
        el('workshopShotTitle').textContent = layout.name;
        el('workshopCounter').textContent = `0 / ${layout.cells.length}`;
        el('workshopProgressText').textContent = '拍好的照片会出现在这里';
        mountStudio();
        paper(el('workshopProgressPaper'), layout);
        fitViewfinder();
        el('workshopNoticeTitle').textContent = `此次拍摄会连续拍 ${layout.cells.length} 次`;
        el('workshopNoticeText').textContent = '先调整美颜、滤镜和背景，再点击右下角开始连拍。默认每张都会语音倒数 3、2、1，拍完一张后自动开始下一张。';
        syncCaptureButton();
        notice.showModal();
        try {
            await Promise.all([prepareCamera(id), prepareAudio(id)]);
        } catch (error) {
            if (id === generation) fail(error, enterCapture);
        }
    }

    function post(endpoint, data) {
        return new Promise((resolve, reject) => {
            request = photoboothTools.ajaxWithCsrf({
                url: `${environment.publicFolders.api}/${endpoint}`, method: 'POST', data, dataType: 'json', timeout: endpoint === 'createWorkshop.php' ? 600000 : 45000
            }).done(response => {
                if (!response || response.error) reject(new Error(response?.error || '服务返回了无效结果，请重试。'));
                else resolve(response);
            }).fail((xhr, state) => reject(new Error(xhr.responseJSON?.error || (state === 'abort' ? 'WORKSHOP_CANCELLED' : '连接失败，已拍照片保留，请重试。'))));
        });
    }

    async function shoot(id) {
        check(id);
        if (commandCapture()) {
            return post('capture.php', { style: 'photo' }).then(response => {
                check(id);
                if (!response.capture_token || !response.file) throw new Error('未取得本次照片，请重试。');
                return { token: response.capture_token, url: `${environment.publicFolders.tmp}/${encodeURIComponent(response.file)}` };
            });
        }
        if (!cameraReady || !cameraStream?.active || previewVideo.readyState < 2 || !previewVideo.videoWidth) {
            throw new Error('摄像头已断开，请重新连接后继续拍摄。');
        }
        const canvas = document.createElement('canvas');
        const source = beautyCanvas && beautyCanvas.style.display !== 'none' && beautyCanvas.width > 0 ? beautyCanvas : previewVideo;
        canvas.width = source.videoWidth || source.width;
        canvas.height = source.videoHeight || source.height;
        const ctx = canvas.getContext('2d');
        // CSS preview filters are not included by drawImage; bake the same
        // filter into each photo. Compensate for capture.php's configured flip.
        ctx.filter = getComputedStyle(source).filter || 'none';
        const configuredFlip = config.preview.flip || 'off';
        const flipX = previewVideo.classList.contains('flip-horizontal') !== ['flip-horizontal', 'flip-both'].includes(configuredFlip);
        const flipY = previewVideo.classList.contains('flip-vertical') !== ['flip-vertical', 'flip-both'].includes(configuredFlip);
        ctx.translate(flipX ? canvas.width : 0, flipY ? canvas.height : 0);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(source, 0, 0);
        const response = await post('capture.php', { style: 'photo', canvasimg: canvas.toDataURL('image/jpeg', 0.96) });
        check(id);
        if (!response.capture_token || !response.file) throw new Error('未取得本次照片，请重试。');
        return { token: response.capture_token, url: `${environment.publicFolders.tmp}/${encodeURIComponent(response.file)}` };
    }

    async function save(id) {
        status(backgroundTemplate ? '全部拍好了，正在逐张更换背景并拼接，首次加载背景模型可能需要一两分钟…' : '全部拍好了，正在拼成一张完整照片…');
        el('workshopShotTitle').textContent = '正在生成成片';
        const response = await post('createWorkshop.php', { layout: layout.id, tokens: photos.map(photo => photo.token), template: backgroundTemplate });
        check(id);
        if (!response.success || !response.file) throw new Error('成片未保存成功，请重试。');
        const completed = layout;
        close(false);
        resultLayout = completed;
        photoBooth.setPhotoboothMode('classic');
        window.sessionPhotoboothMode = 'classic';
        window.studioClassicLayout = 'single';
        window.burstLayout = '';
        window.burstModeActive = false;
        window.burstActive = false;
        photoBooth.renderPic(response.file, response.images, null, null, 'plain');
    }

    async function run() {
        if (running || !active) return;
        if (!photos.length) {
            countdownSeconds = Math.max(1, Math.min(10, parseInt(el('studioCountdownSelect').value, 10) || 3));
            backgroundTemplate = window.selectedClassicTemplate?.id !== 'none' ? window.selectedClassicTemplate?.image || '' : '';
        }
        running = true;
        syncCaptureButton();
        photoBooth.stopStudioPoseCarousel();
        const id = generation;
        if (notice.open) notice.close();
        el('workshopRetry').hidden = true;
        try {
            if (!audioReady) await prepareAudio(id);
            if (photos.length < layout.cells.length && (!cameraReady || !cameraStream?.active)) {
                stopCamera();
                await prepareCamera(id);
            }
            while (photos.length < layout.cells.length) {
                check(id);
                const number = photos.length + 1;
                el('workshopShotTitle').textContent = `第 ${number} 张，共 ${layout.cells.length} 张`;
                paper(el('workshopProgressPaper'), layout, photos, photos.length);
                fitViewfinder();
                status(`看镜头，第 ${number} 张马上开始。`);
                for (let count = countdownSeconds; count >= 1; count--) {
                    check(id);
                    el('workshopCountdown').textContent = count;
                    el('workshopCountdown').hidden = false;
                    playCountdown(count);
                    await wait(1000);
                }
                check(id);
                el('workshopCountdown').hidden = true;
                stopCountdownAudio();
                status(`正在保存第 ${number} 张，请稍候…`);
                const captured = await shoot(id);
                photos.push(captured);
                el('workshopFlash').hidden = false;
                paper(el('workshopProgressPaper'), layout, photos);
                el('workshopCounter').textContent = `${photos.length} / ${layout.cells.length}`;
                el('workshopProgressText').textContent = `已完成 ${photos.length} 张，还剩 ${layout.cells.length - photos.length} 张`;
                status(photos.length < layout.cells.length ? `第 ${number} 张拍好了！换个姿势，下一张即将开始。` : '全部拍好了！');
                await wait(160);
                check(id);
                el('workshopFlash').hidden = true;
                if (photos.length < layout.cells.length) await wait(700);
            }
            check(id);
            await save(id);
        } catch (error) {
            if (id === generation) fail(error, run);
        } finally {
            if (id === generation) { running = false; if (active) syncCaptureButton(); }
        }
    }

    function selection() {
        cancelSession();
        el('workshopSelection').hidden = false;
        el('workshopCapture').hidden = true;
        el('workshopBack').querySelector('span').textContent = '返回首页';
        select(layout.id);
        el('workshopTitle').focus();
    }

    function open() {
        photoBooth.reset();
        active = true;
        resultLayout = null;
        document.querySelectorAll('.stage--active').forEach(stage => stage.classList.remove('stage--active'));
        document.body.classList.add('mode--workshop');
        root.hidden = false;
        root.scrollTop = 0;
        selection();
    }

    function close(home = true) {
        active = false;
        cancelSession();
        root.hidden = true;
        document.body.classList.remove('mode--workshop');
        if (home) {
            resultLayout = null;
            photoBooth.init();
            el('btnWorkshopStart').focus();
        }
    }

    catalog.layouts.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'workshop__layout';
        button.dataset.layout = item.id;
        button.setAttribute('aria-label', `${item.name}，连续拍 ${item.cells.length} 张`);
        const preview = document.createElement('div');
        preview.className = 'workshop__paper';
        preview.setAttribute('aria-hidden', 'true');
        paper(preview, item);
        const name = document.createElement('strong');
        name.textContent = item.name;
        const count = document.createElement('small');
        count.textContent = `连续拍 ${item.cells.length} 张`;
        button.append(preview, name, count);
        button.addEventListener('click', () => select(item.id));
        el('workshopLayouts').append(button);
    });
    el('cardModeWorkshop').addEventListener('click', open);
    el('cardModeWorkshop').addEventListener('keydown', event => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            open();
        }
    });
    el('workshopChoose').addEventListener('click', enterCapture);
    el('workshopStart').addEventListener('click', () => { notice.close(); el('studioSmoothSlider').focus(); });
    el('workshopChangeLayout').addEventListener('click', back);
    el('workshopRetry').addEventListener('click', () => { if (!running && retryAction) retryAction(); });
    el('workshopNoticeBack').addEventListener('click', selection);
    notice.addEventListener('cancel', event => { event.preventDefault(); selection(); });
    el('workshopBack').addEventListener('click', () => {
        if (el('workshopCapture').hidden) close();
        else back();
    });
    // Any tab switch invalidates the countdown. Returning requires a deliberate resume.
    document.addEventListener('visibilitychange', () => {
        if (active && running && document.hidden) {
            generation++;
            if (request) request.abort();
            request = null;
            fail(new Error('拍摄已暂停。回到页面后，点击继续拍摄。'), run);
        }
    });
    window.addEventListener('resize', fitViewfinder);
    window.addEventListener('pagehide', () => { active = false; cancelSession(); });
    // Update labels after the existing editor has loaded the generated photo.
    const resultStage = document.querySelector('.stage--result');
    if (resultStage) new MutationObserver(() => {
        if (resultLayout && resultStage.classList.contains('stage--active')) {
            el('lblResultPaperTitle').textContent = `创意工坊 · ${resultLayout.name}`;
            el('lblResultPaperDetail').textContent = resultLayout.spec || '6 寸竖版 · 1200 × 1800 像素 · 300 DPI';
        }
    }).observe(resultStage, { attributes: true, attributeFilter: ['class'] });
    window.creativeWorkshop = {
        open, close, back, start: run,
        get active() { return active; },
        get resultLayout() { return resultLayout; },
        reset() { if (active) close(false); resultLayout = null; }
    };
})();
