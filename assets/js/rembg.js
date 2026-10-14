/* Photobooth AI Cutout, 60FPS Contour Flow, Click-to-Composite & Custom Template Resizer */
(function ($) {
    'use strict';

    function setMattingLoadingState(isLoading, engineName) {
        const stageResult = $('.stage[data-stage="result"]');
        const sidebarButtons = $('#resultSidebar .button, .result-sidebar .button');
        const rembgBtn = $('.rembgbtn, [data-command="rembgbtn"]');
        const loader = $('#stageMattingLoader');
        const engineHint = $('#stageMattingEngineHint');

        if (isLoading) {
            stageResult.addClass('stage-matting-locked');
            $('body').addClass('stage-matting-locked');
            rembgBtn.addClass('is-matting-loading');
            sidebarButtons.not('.rembgbtn, [data-command="rembgbtn"]').prop('disabled', true);

            const curEngine = engineName || selectedEngine || 'birefnet';
            if (engineHint.length) {
                if (curEngine === 'rmbg2') {
                    engineHint.text('RMBG-2.0 (全身照/合影优化) 模型推理中...');
                } else {
                    engineHint.text('BiRefNet (半身照/发丝优化) 模型推理中...');
                }
            }
            loader.addClass('is-active').show();
        } else {
            stageResult.removeClass('stage-matting-locked');
            $('body').removeClass('stage-matting-locked');
            rembgBtn.removeClass('is-matting-loading');
            sidebarButtons.prop('disabled', false);
            loader.removeClass('is-active').hide();
        }
    }

    window.rembgReset = function () {
        setMattingLoadingState(false);
        $('#rembgModal').removeClass('active sidenav--open').hide();
        $('#stageCutoutViewport').hide();
        $('#stagePersonTransformBox, #stagePersonResizerBar, #stageTransformBox, #stageBgResizerBar').hide();
        $('.stage[data-stage="result"]').removeClass('cutout-mode-active').removeAttr('data-original-img');
        isCutoutExtracted = false;
        cutoutPngUrl = '';
        baseOriginalName = '';
        currentTemplate = '';
        cutoutState = 'idle';
        latestCompositeFile = '';
        isProcessingTemplate = false;
        isCustomTemplateActive = false;
        isPersonActive = false;
        customScale = 1.0;
        customOffsetX = 0;
        customOffsetY = 0;
        personScale = 1.0;
        personOffsetX = 0;
        personOffsetY = 0;
        if (recompositeTimer) {
            clearTimeout(recompositeTimer);
            recompositeTimer = null;
        }
        if (personRecompositeTimer) {
            clearTimeout(personRecompositeTimer);
            personRecompositeTimer = null;
        }
        $('#stageCutoutPerson').removeClass('is-switching');
    };

    function getCleanOriginalName(rawName) {
        if (!rawName) return '';
        let name = String(rawName).trim();
        if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) {
            name = name.split('/').pop().split('\\').pop();
        }
        if (name.indexOf('?') !== -1) {
            name = name.split('?')[0];
        }
        if (name.indexOf('_rembg_') !== -1) {
            name = name.split('_rembg_')[0] + '.jpg';
        }
        return name;
    }

    let currentTemplate = '';
    let baseOriginalName = '';
    let latestCompositeFile = '';
    let isCutoutExtracted = false;
    let cutoutPngUrl = '';
    let cutoutRequestId = 0;
    let cutoutState = 'idle';
    let isProcessingTemplate = false;
    let selectedEngine = 'birefnet';

    // Custom template transform parameters
    let customScale = 1.0;
    let customOffsetX = 0;
    let customOffsetY = 0;
    let isCustomTemplateActive = false;
    let recompositeTimer = null;

    // Cutout person transform parameters
    let personScale = 1.0;
    let personOffsetX = 0;
    let personOffsetY = 0;
    let isPersonActive = false;
    let personRecompositeTimer = null;

    function notifyRembg(type, message) {
        if (window.photoboothTools && window.photoboothTools.showNotification) {
            window.photoboothTools.showNotification(type, message);
        }
    }

    function initRembg() {
        const modal = $('#rembgModal');
        const grid = $('#rembgTemplateGrid');
        const selectedNameEl = $('#rembgSelectedName');
        const uploadInput = $('#rembgTemplateUpload');
        const revertBtn = $('#btnRembgRevert');
        const closeBtn = $('#btnRembgClose');

        const cutoutViewport = $('#stageCutoutViewport');
        const cutoutBg = $('#stageCutoutBg');
        const cutoutPerson = $('#stageCutoutPerson');
        const personImg = $('#stagePersonImg');
        const contourCanvas = $('#stageContourCanvas');

        // Background template transform controls
        const transformBox = $('#stageTransformBox');
        const resizerBar = $('#stageBgResizerBar');
        const lblBgScaleVal = $('#lblBgScaleVal');
        const btnScaleMinus = $('#btnBgScaleMinus');
        const btnScalePlus = $('#btnBgScalePlus');
        const btnScaleFit = $('#btnBgScaleFit');
        const btnScaleReset = $('#btnBgScaleReset');

        // Cutout person transform controls
        const personTransformBox = $('#stagePersonTransformBox');
        const personResizerBar = $('#stagePersonResizerBar');
        const lblPersonScaleVal = $('#lblPersonScaleVal');
        const btnPersonScaleMinus = $('#btnPersonScaleMinus');
        const btnPersonScalePlus = $('#btnPersonScalePlus');
        const btnPersonReset = $('#btnPersonReset');

        let contourAnimationId = 0;

        $(document).off('.rembg');

        // Engine switcher (ensure disabled buttons like FeyNoBg cannot be clicked)
        $(document).off('click.rembgEngine', '.rembg-engine-btn').on('click.rembgEngine', '.rembg-engine-btn', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if ($(this).is(':disabled') || $(this).hasClass('is-disabled') || isProcessingTemplate || cutoutState === 'extracting') {
                return;
            }
            const newEngine = $(this).attr('data-engine') || 'birefnet';
            if (newEngine === selectedEngine && isCutoutExtracted) {
                return;
            }
            selectedEngine = newEngine;
            $('.rembg-engine-btn').removeClass('active');
            $(this).addClass('active');

            // If session is already open/active, smoothly switch without clearing stage or drawer
            if (modal.hasClass('active') || cutoutViewport.is(':visible') || isCutoutExtracted) {
                switchEngineInSession(selectedEngine);
            } else {
                isCutoutExtracted = false;
                cutoutPngUrl = '';
                cutoutPerson.css('visibility', 'hidden');
                startMattingAndFlow();
            }
        });

        // 1. User clicks "AI抠图换景": Start flow with lock guard
        $(document).off('click.rembgOpen', '.rembgbtn, [data-command="rembgbtn"]').on('click.rembgOpen', '.rembgbtn, [data-command="rembgbtn"]', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (cutoutState === 'extracting' || isProcessingTemplate || $('.stage-matting-locked').length > 0) {
                return;
            }
            startMattingAndFlow();
        });

        // 2. Click template card -> Immediately composite & interlock with mutex (Document-level delegation)
        $(document).off('click.rembgTemplate', '.rembg-template-card').on('click.rembgTemplate', '.rembg-template-card', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const card = $(this);
            if (isProcessingTemplate) {
                notifyRembg('warning', '当前模板正在合成替换中，请稍候...');
                return;
            }
            if (card.hasClass('is-loading')) {
                return;
            }
            const tplPath = card.attr('data-path');
            const tplName = card.attr('data-name');
            applyTemplateComposite(tplPath, tplName, card);
        });

        // 3. Delete custom template handler
        $(document).off('click.rembgDelTemplate', '.rembg-template-del-btn').on('click.rembgDelTemplate', '.rembg-template-del-btn', function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const btn = $(this);
            const card = btn.closest('.rembg-template-card');
            const tplPath = btn.attr('data-path') || card.attr('data-path');

            if (!tplPath || btn.prop('disabled')) return;

            const confirmed = window.confirm('确定要删除该自定义背景模板吗？删除后不可恢复。');
            if (!confirmed) return;

            btn.prop('disabled', true).addClass('is-loading');

            $.ajax({
                url: 'api/deleteTemplate.php',
                type: 'POST',
                data: { file: tplPath },
                dataType: 'json'
            }).done(function (res) {
                if (res && res.success) {
                    notifyRembg('success', '自定义模板已删除');

                    // If currently active template was deleted, fallback to transparent
                    if (currentTemplate === tplPath) {
                        const transparentCard = grid.find('.rembg-template-card[data-path="transparent"]');
                        applyTemplateComposite('transparent', '透明背景 (PNG)', transparentCard);
                    }

                    card.css({
                        transition: 'opacity 0.25s ease, transform 0.25s ease',
                        opacity: 0,
                        transform: 'scale(0.8)'
                    });
                    setTimeout(function () {
                        card.remove();
                    }, 250);
                } else {
                    notifyRembg('error', (res && res.error) || '删除模板失败');
                    btn.prop('disabled', false).removeClass('is-loading');
                }
            }).fail(function (xhr, status, error) {
                const response = xhr && xhr.responseJSON;
                const msg = (response && (response.error || response.message)) || error || '删除模板请求失败';
                notifyRembg('error', msg);
                btn.prop('disabled', false).removeClass('is-loading');
            });
        });

        // Close drawer
        $(document).off('click.rembgClose', '#btnRembgClose').on('click.rembgClose', '#btnRembgClose', function (e) {
            e.preventDefault();
            e.stopPropagation();
            completeRembgAndApplyToStage();
        });

        // Done button: Complete composite and replace image on stage
        $(document).off('click.rembgDone', '#btnRembgDone').on('click.rembgDone', '#btnRembgDone', function (e) {
            e.preventDefault();
            e.stopPropagation();
            completeRembgAndApplyToStage();
        });

        // Revert to original
        $(document).off('click.rembgRevert', '#btnRembgRevert').on('click.rembgRevert', '#btnRembgRevert', function (e) {
            e.preventDefault();
            e.stopPropagation();
            revertToOriginal();
        });

        // File upload for custom template
        $(document).off('change.rembgUpload', '#rembgTemplateUpload').on('change.rembgUpload', '#rembgTemplateUpload', function () {
            if (this.files && this.files[0]) {
                uploadCustomTemplate(this.files[0]);
            }
        });

        // Quick resizer toolbar events
        btnScaleMinus.on('click', function (e) {
            e.preventDefault();
            setCustomScale(customScale - 0.1);
        });

        btnScalePlus.on('click', function (e) {
            e.preventDefault();
            setCustomScale(customScale + 0.1);
        });

        btnScaleFit.on('click', function (e) {
            e.preventDefault();
            customScale = 1.0;
            customOffsetX = 0;
            customOffsetY = 0;
            updateTransformView();
            scheduleRecomposite();
        });

        btnScaleReset.on('click', function (e) {
            e.preventDefault();
            customScale = 1.0;
            customOffsetX = 0;
            customOffsetY = 0;
            updateTransformView();
            scheduleRecomposite();
        });

        // Bind interactive drag/resize on transformBox
        bindTransformBoxGestures();

        // Person quick resizer toolbar events
        btnPersonScaleMinus.on('click', function (e) {
            e.preventDefault();
            setPersonScale(personScale - 0.1);
        });

        btnPersonScalePlus.on('click', function (e) {
            e.preventDefault();
            setPersonScale(personScale + 0.1);
        });

        btnPersonReset.on('click', function (e) {
            e.preventDefault();
            personScale = 1.0;
            personOffsetX = 0;
            personOffsetY = 0;
            updatePersonTransformView();
            schedulePersonRecomposite();
        });

        // Bind interactive drag/resize on cutout person
        bindPersonTransformGestures();

        // Window resize adjusts transform box positions
        $(window).off('resize.rembgPerson').on('resize.rembgPerson', function () {
            if (isPersonActive) {
                updatePersonTransformView();
            }
            if (isCustomTemplateActive) {
                updateTransformView();
            }
        });

        /* ========================================================
           Main Flow: Extract -> 60FPS Contour Flow -> Lift -> Pop Drawer
           ======================================================== */
        function switchEngineInSession(engine) {
            if (isProcessingTemplate || cutoutState === 'extracting') return;

            const resultPage = $('.stage[data-stage="result"]');
            baseOriginalName = getCleanOriginalName(resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || resultPage.attr('data-img') || baseOriginalName);

            if (!baseOriginalName) {
                notifyRembg('error', '未检测到当前拍摄照片');
                return;
            }

            cutoutState = 'extracting';
            setMattingLoadingState(true, engine);
            cutoutPerson.addClass('is-switching');
            const requestId = ++cutoutRequestId;
            notifyRembg('info', '正在切换至 ' + (engine === 'rmbg2' ? 'RMBG-2.0' : 'BiRefNet') + ' 模型推理...');

            $.ajax({
                url: 'api/rembgProcess.php',
                type: 'POST',
                data: {
                    file: baseOriginalName,
                    template: 'transparent',
                    action: 'apply',
                    engine: engine || selectedEngine || 'birefnet'
                },
                dataType: 'json',
                timeout: 35000
            }).done(function (res) {
                if (requestId !== cutoutRequestId) return;
                if (!res || !res.success || !res.file) {
                    cutoutState = 'ready';
                    setMattingLoadingState(false);
                    cutoutPerson.removeClass('is-switching');
                    notifyRembg('error', (res && res.error) || '切换抠图引擎失败');
                    return;
                }

                cutoutPngUrl = '/data/images/' + res.file + '?v=' + Date.now();
                latestCompositeFile = res.file;
                isCutoutExtracted = true;

                const preloader = new Image();
                preloader.onload = function () {
                    if (requestId !== cutoutRequestId) return;
                    personImg.attr('src', cutoutPngUrl);
                    cutoutPerson.removeClass('is-switching').css('visibility', 'visible');
                    cutoutState = 'ready';
                    setMattingLoadingState(false);
                    notifyRembg('success', '已切换至 ' + (engine === 'rmbg2' ? 'RMBG-2.0' : 'BiRefNet') + ' 抠图引擎');

                    // If a background template (custom or preset) was already selected, auto-recomposite with the new cutout!
                    if (currentTemplate && currentTemplate !== 'transparent' && currentTemplate !== 'none') {
                        const activeCard = grid.find(`.rembg-template-card[data-path="${currentTemplate}"]`);
                        const tplName = (activeCard.length && activeCard.attr('data-name')) || selectedNameEl.text();
                        applyTemplateComposite(currentTemplate, tplName, activeCard);
                    }
                };
                preloader.onerror = function () {
                    if (requestId !== cutoutRequestId) return;
                    cutoutState = 'ready';
                    setMattingLoadingState(false);
                    cutoutPerson.removeClass('is-switching');
                    notifyRembg('error', '透明前景加载异常');
                };
                preloader.src = cutoutPngUrl;
            }).fail(function (xhr, status, error) {
                if (requestId !== cutoutRequestId) return;
                cutoutState = 'ready';
                setMattingLoadingState(false);
                cutoutPerson.removeClass('is-switching');
                notifyRembg('error', '切换抠图引擎失败：' + (error || status || '网络请求异常'));
            });
        }

        function startMattingAndFlow() {
            const resultPage = $('.stage[data-stage="result"]');

            const prevOriginal = baseOriginalName;
            if (!resultPage.attr('data-camera-img')) {
                const initialCandidate = resultPage.attr('data-original-img') || resultPage.attr('data-img') || '';
                resultPage.attr('data-camera-img', getCleanOriginalName(initialCandidate));
            }
            baseOriginalName = getCleanOriginalName(resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || resultPage.attr('data-img'));

            if (prevOriginal && prevOriginal !== baseOriginalName) {
                isCutoutExtracted = false;
                cutoutPngUrl = '';
                latestCompositeFile = '';
            }

            if (!baseOriginalName) {
                notifyRembg('error', '未检测到当前拍摄照片');
                return;
            }

            if ($('#filternav').hasClass('sidenav--open')) {
                $('#filternav').removeClass('sidenav--open');
            }
            if ($('#beautyModal').length) {
                $('#beautyModal').removeClass('active sidenav--open').hide();
            }

            if (window.photoBooth && typeof window.photoBooth.clearTimeOut === 'function') {
                window.photoBooth.clearTimeOut();
            }

            // Keep right drawer CLOSED initially as requested
            modal.removeClass('active sidenav--open').hide();
            transformBox.hide();
            resizerBar.hide();
            personTransformBox.hide();
            personResizerBar.hide();
            personScale = 1.0;
            personOffsetX = 0;
            personOffsetY = 0;
            isPersonActive = false;
            if (cutoutPerson[0]) {
                cutoutPerson[0].style.setProperty('transform', 'none', 'important');
            }

            // Prepare stage viewport
            cutoutViewport.show();
            cutoutBg.css({ 'background-image': 'none', 'background-color': 'transparent' });
            cutoutPerson.removeClass('is-lifted').css('visibility', 'hidden');

            if (isCutoutExtracted && cutoutPngUrl && personImg.attr('src')) {
                // Cutout already extracted, replay 60FPS contour trace directly
                runContourFlowAndPopDrawer(personImg[0]);
                return;
            }

            // Extract person mask via backend
            cutoutState = 'extracting';
            setMattingLoadingState(true, selectedEngine);
            const requestId = ++cutoutRequestId;
            notifyRembg('info', '正在进行 AI 人物定位与智能抠图...');

            $.ajax({
                url: 'api/rembgProcess.php',
                type: 'POST',
                data: {
                    file: baseOriginalName,
                    template: 'transparent',
                    action: 'apply',
                    engine: selectedEngine || 'birefnet'
                },
                dataType: 'json',
                timeout: 35000
            }).done(function (res) {
                if (requestId !== cutoutRequestId) return;
                if (!res || !res.success || !res.file) {
                    cutoutState = 'error';
                    setMattingLoadingState(false);
                    notifyRembg('error', (res && res.error) || 'AI 抠图失败');
                    return;
                }

                cutoutPngUrl = '/data/images/' + res.file + '?v=' + Date.now();
                latestCompositeFile = res.file;
                isCutoutExtracted = false;
                cutoutState = 'animating';

                personImg.off('load error').on('load', function () {
                    setMattingLoadingState(false);
                    runContourFlowAndPopDrawer(this);
                }).on('error', function () {
                    cutoutState = 'error';
                    setMattingLoadingState(false);
                    resultPage.removeClass('cutout-mode-active');
                    cutoutViewport.hide();
                    cutoutPerson.css('visibility', 'hidden');
                    notifyRembg('error', '透明人物前景加载失败');
                }).attr('src', cutoutPngUrl);
            }).fail(function (xhr, status, error) {
                if (requestId !== cutoutRequestId) return;
                cutoutState = 'error';
                setMattingLoadingState(false);
                notifyRembg('error', 'AI 抠图失败：' + (error || status || '网络请求异常'));
            });
        }

        // Run 60FPS contour trace flow, then lift person, then slide in right drawer
        function runContourFlowAndPopDrawer(imgElem) {
            setMattingLoadingState(false);
            const resultPage = $('.stage[data-stage="result"]');
            cutoutViewport.show();
            cutoutPerson.css('visibility', 'hidden');

            playContourAnimation(imgElem, contourCanvas, function () {
                // 1. Contour flow finished -> pop out & highlight person
                resultPage.addClass('cutout-mode-active');
                cutoutPerson.css('visibility', 'visible').addClass('is-lifted');
                isCutoutExtracted = true;
                cutoutState = 'ready';
                isPersonActive = true;

                // 2. Allow customizing person position: show selection box & resizer toolbar
                personTransformBox.show();
                personResizerBar.show();
                updatePersonTransformView();

                // 3. Smoothly pop open the right-side template selection drawer
                setTimeout(function () {
                    if ($('#beautyModal').length) {
                        $('#beautyModal').removeClass('active sidenav--open').hide();
                    }
                    modal.addClass('active sidenav--open').show();
                    loadTemplates();
                }, 200);
            });
        }

        /* ========================================================
           60FPS High-Precision Silky Smooth Dynamic Contour Flow
           ======================================================== */
        function playContourAnimation(imgElement, canvasElement, onComplete) {
            const canvas = canvasElement[0] || canvasElement;
            const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
            if (!ctx) {
                if (onComplete) onComplete();
                return;
            }

            const animationToken = ++contourAnimationId;
            function isCurrentAnimation() {
                return animationToken === contourAnimationId;
            }

            const stageResult = $('.stage--result');
            const cWidth = stageResult.width() || window.innerWidth;
            const cHeight = stageResult.height() || window.innerHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            canvas.width = Math.round(cWidth * dpr);
            canvas.height = Math.round(cHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const natW = imgElement.naturalWidth || imgElement.width || cWidth;
            const natH = imgElement.naturalHeight || imgElement.height || cHeight;

            const stageRatio = cWidth / cHeight;
            const imgRatio = natW / natH;
            let renderW, renderH, renderX, renderY;
            if (imgRatio > stageRatio) {
                renderW = cWidth;
                renderH = cWidth / imgRatio;
                renderX = 0;
                renderY = (cHeight - renderH) / 2;
            } else {
                renderH = cHeight;
                renderW = cHeight * imgRatio;
                renderX = (cWidth - renderW) / 2;
                renderY = 0;
            }

            const offW = Math.min(natW, 960);
            const offH = Math.max(30, Math.round(offW * (natH / natW)));
            const off = document.createElement('canvas');
            off.width = offW;
            off.height = offH;
            const offCtx = off.getContext('2d');
            offCtx.drawImage(imgElement, 0, 0, offW, offH);

            let imgData;
            try {
                imgData = offCtx.getImageData(0, 0, offW, offH);
            } catch (e) {
                if (onComplete) onComplete();
                return;
            }

            const data = imgData.data;
            const alphaAt = (x, y) => {
                if (x < 0 || x >= offW || y < 0 || y >= offH) return 0;
                return data[(y * offW + x) * 4 + 3];
            };

            let start = null;
            for (let y = 0; y < offH; y++) {
                for (let x = 0; x < offW; x++) {
                    if (alphaAt(x, y) > 90) {
                        start = { x: x, y: y };
                        break;
                    }
                }
                if (start) break;
            }

            if (!start) {
                if (onComplete) onComplete();
                return;
            }

            const dirs = [
                { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
                { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }
            ];

            const rawPts = [];
            let curr = { x: start.x, y: start.y };
            let backtrack = 6;

            for (let step = 0; step < 4000; step++) {
                rawPts.push({
                    x: renderX + (curr.x / offW) * renderW,
                    y: renderY + (curr.y / offH) * renderH
                });

                let found = false;
                for (let i = 0; i < 8; i++) {
                    const dirIdx = (backtrack + i) % 8;
                    const nx = curr.x + dirs[dirIdx].x;
                    const ny = curr.y + dirs[dirIdx].y;
                    if (alphaAt(nx, ny) > 90) {
                        curr = { x: nx, y: ny };
                        backtrack = (dirIdx + 5) % 8;
                        found = true;
                        break;
                    }
                }
                if (!found || (curr.x === start.x && curr.y === start.y && step > 20)) {
                    break;
                }
            }

            if (rawPts.length < 8) {
                if (onComplete) onComplete();
                return;
            }

            const resampled = [];
            let lastP = rawPts[0];
            resampled.push(lastP);
            const minSpacing = Math.max(2, Math.min(5, Math.min(renderW, renderH) / 180));
            const minSqDist = minSpacing * minSpacing;

            for (let i = 1; i < rawPts.length; i++) {
                const p = rawPts[i];
                const dx = p.x - lastP.x;
                const dy = p.y - lastP.y;
                if (dx * dx + dy * dy >= minSqDist) {
                    resampled.push(p);
                    lastP = p;
                }
            }

            let smoothPts = resampled;
            const n = smoothPts.length;
            for (let pass = 0; pass < 3; pass++) {
                const nextPass = [];
                for (let i = 0; i < n; i++) {
                    const pPrev = smoothPts[(i - 1 + n) % n];
                    const pCurr = smoothPts[i];
                    const pNext = smoothPts[(i + 1) % n];
                    nextPass.push({
                        x: 0.25 * pPrev.x + 0.5 * pCurr.x + 0.25 * pNext.x,
                        y: 0.25 * pPrev.y + 0.5 * pCurr.y + 0.25 * pNext.y
                    });
                }
                smoothPts = nextPass;
            }

            const totalPts = smoothPts.length;

            function renderSplinePath(context, points, count) {
                if (count < 2) return;
                context.beginPath();
                const startMidX = (points[0].x + points[1].x) / 2;
                const startMidY = (points[0].y + points[1].y) / 2;
                context.moveTo(startMidX, startMidY);

                for (let i = 1; i < count; i++) {
                    const pCurr = points[i];
                    const nextIndex = i + 1 < count ? i + 1 : (count === points.length ? 0 : i);
                    const pNext = points[nextIndex];
                    const midX = (pCurr.x + pNext.x) / 2;
                    const midY = (pCurr.y + pNext.y) / 2;
                    context.quadraticCurveTo(pCurr.x, pCurr.y, midX, midY);
                }
                if (count < points.length) {
                    const last = points[count - 1];
                    context.lineTo(last.x, last.y);
                }
            }

            // 60FPS fluid curve dynamic flow across ~800ms
            const duration = 800;
            let startAnimTime = null;

            function step(timestamp) {
                if (!isCurrentAnimation()) return;
                if (!startAnimTime) startAnimTime = timestamp;
                const elapsed = timestamp - startAnimTime;
                const progress = Math.min(elapsed / duration, 1.0);

                ctx.clearRect(0, 0, cWidth, cHeight);

                const currentCount = Math.floor(progress * totalPts);
                if (currentCount > 1) {
                    ctx.save();

                    // Outer Cyan Neon Glow
                    renderSplinePath(ctx, smoothPts, currentCount);
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 18;
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();

                    // White Core Laser Beam
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = '#ffffff';
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.8;
                    ctx.stroke();

                    // Flowing Tip Comet
                    const tip = smoothPts[Math.min(currentCount, totalPts - 1)];
                    ctx.beginPath();
                    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 20;
                    ctx.fill();

                    ctx.restore();
                }

                if (progress < 1.0) {
                    requestAnimationFrame(step);
                } else {
                    // Flash bloom on completion
                    let flashProgress = 0;
                    function flash() {
                        if (!isCurrentAnimation()) return;
                        flashProgress += 0.08;
                        ctx.clearRect(0, 0, cWidth, cHeight);
                        if (flashProgress < 1.0) {
                            const alpha = (1.0 - flashProgress) * 0.8;
                            ctx.save();
                            renderSplinePath(ctx, smoothPts, totalPts);
                            ctx.closePath();
                            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                            ctx.shadowColor = '#38bdf8';
                            ctx.shadowBlur = 25 * (1.0 - flashProgress);
                            ctx.lineWidth = 4.5;
                            ctx.stroke();
                            ctx.restore();
                            requestAnimationFrame(flash);
                        } else {
                            ctx.clearRect(0, 0, cWidth, cHeight);
                            if (onComplete) onComplete();
                        }
                    }
                    requestAnimationFrame(flash);
                }
            }

            requestAnimationFrame(step);
        }

        /* ========================================================
           Click-to-Composite & Interlock Mechanism
           ======================================================== */
        function applyTemplateComposite(tplPath, tplName, cardElement) {
            if (isProcessingTemplate) {
                notifyRembg('warning', '当前模板正在合成替换中，请稍候...');
                return;
            }

            const path = tplPath || 'transparent';
            currentTemplate = path;

            if (!baseOriginalName) {
                const resultPage = $('.stage[data-stage="result"]');
                baseOriginalName = getCleanOriginalName(resultPage.attr('data-camera-img') || resultPage.attr('data-original-img') || resultPage.attr('data-img') || '');
            } else {
                baseOriginalName = getCleanOriginalName(baseOriginalName);
            }

            // Target card reference
            const targetCard = (cardElement && cardElement.length)
                ? cardElement
                : grid.find(`.rembg-template-card[data-path="${path}"]`);

            // Mark processing & lock all template cards
            isProcessingTemplate = true;
            grid.find('.rembg-template-card').addClass('is-locked').removeClass('active is-loading');
            if (targetCard && targetCard.length) {
                targetCard.removeClass('is-locked').addClass('active is-loading');
            }

            selectedNameEl.text(tplName || '透明背景 (PNG)').show();

            // Detect if this is a custom uploaded template
            isCustomTemplateActive = (
                path.indexOf('custom_') !== -1 ||
                (tplName && tplName.indexOf('自定义') !== -1) ||
                path.indexOf('/data/templates/') !== -1
            );

            if (isCustomTemplateActive) {
                transformBox.show();
                resizerBar.show();
                updateTransformView();
            } else {
                transformBox.hide();
                resizerBar.hide();
                customScale = 1.0;
                customOffsetX = 0;
                customOffsetY = 0;
            }

            // Real-time preview update immediately for instant user perception
            if (path === 'transparent' || path === 'none') {
                cutoutBg.css({ 'background-image': 'none', 'background-color': 'transparent' });
                if (cutoutBg[0]) {
                    cutoutBg[0].style.setProperty('background-image', 'none', 'important');
                    cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
                }
            } else {
                const escapedPath = String(path).replace(/\\/g, '/').replace(/"/g, '\\"');
                const bgUrl = escapedPath.startsWith('http') || escapedPath.startsWith('/')
                    ? escapedPath
                    : '/' + escapedPath;
                cutoutBg.css({
                    'background-color': 'transparent',
                    'background-image': 'url("' + bgUrl + '")'
                });
                if (cutoutBg[0]) {
                    cutoutBg[0].style.setProperty('background-image', 'url("' + bgUrl + '")', 'important');
                    cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
                }
            }

            // Immediately start matting composite on backend
            const postData = {
                file: baseOriginalName,
                template: path,
                action: 'apply',
                engine: selectedEngine || 'birefnet',
                scale: customScale,
                offset_x: getNormalizedOffsetX(),
                offset_y: getNormalizedOffsetY(),
                person_scale: personScale,
                person_offset_x: getNormalizedPersonOffsetX(),
                person_offset_y: getNormalizedPersonOffsetY()
            };

            $.ajax({
                url: 'api/rembgProcess.php',
                type: 'POST',
                data: postData,
                dataType: 'json',
                timeout: 35000
            }).done(function (res) {
                if (!res || !res.success || !res.file) {
                    const message = (res && res.error) || '模板合成失败';
                    notifyRembg('error', message);
                    return;
                }
                latestCompositeFile = res.file;
                const resultPage = $('.stage[data-stage="result"]');
                const newImgUrl = '/data/images/' + res.file + '?v=' + Date.now();
                resultPage.attr('data-img', res.file).css('--stage-background-image', 'url("' + newImgUrl + '")');
                if (window.photoBooth) {
                    window.photoBooth.filename = res.file;
                }
                notifyRembg('success', '背景替换完成');
            }).fail(function (xhr, status, error) {
                const response = xhr && xhr.responseJSON;
                const message = (response && (response.error || response.message)) || error || '模板合成失败';
                notifyRembg('error', message);
            }).always(function () {
                // Unlock mutex and restore cards
                isProcessingTemplate = false;
                if (targetCard && targetCard.length) {
                    targetCard.removeClass('is-loading').addClass('active');
                }
                grid.find('.rembg-template-card').removeClass('is-locked');
            });
        }

        /* ========================================================
           Custom Template Interactive Transform & Drag Engine
           ======================================================== */
        function getNormalizedOffsetX() {
            const vpW = cutoutViewport.width() || window.innerWidth;
            return vpW > 0 ? (customOffsetX / vpW) : 0;
        }

        function getNormalizedOffsetY() {
            const vpH = cutoutViewport.height() || window.innerHeight;
            return vpH > 0 ? (customOffsetY / vpH) : 0;
        }

        function setCustomScale(val) {
            customScale = Math.max(0.3, Math.min(3.5, parseFloat(val.toFixed(2))));
            updateTransformView();
            scheduleRecomposite();
        }

        function updateTransformView() {
            // Apply scale & translation to background layer in viewport
            cutoutBg.css({
                'transform': `translate(${customOffsetX}px, ${customOffsetY}px) scale(${customScale})`,
                'transform-origin': 'center center'
            });

            // Update transform bounding box position
            const vpW = cutoutViewport.width() || window.innerWidth;
            const vpH = cutoutViewport.height() || window.innerHeight;
            const boxW = Math.min(vpW, vpH * 1.5) * 0.8 * customScale;
            const boxH = (boxW * (vpH / vpW));

            transformBox.css({
                width: boxW + 'px',
                height: boxH + 'px',
                left: 'calc(50% + ' + customOffsetX + 'px - ' + (boxW / 2) + 'px)',
                top: 'calc(50% + ' + customOffsetY + 'px - ' + (boxH / 2) + 'px)'
            });

            lblBgScaleVal.text(Math.round(customScale * 100) + '%');
        }

        function scheduleRecomposite() {
            if (recompositeTimer) clearTimeout(recompositeTimer);
            recompositeTimer = setTimeout(function () {
                if (currentTemplate && isCustomTemplateActive && !isProcessingTemplate) {
                    const activeCard = grid.find('.rembg-template-card.active');
                    applyTemplateComposite(currentTemplate, activeCard.attr('data-name'), activeCard);
                }
            }, 350);
        }

        function bindTransformBoxGestures() {
            let isDraggingMove = false;
            let isDraggingHandle = false;
            let dragStartX = 0;
            let dragStartY = 0;
            let initOffsetX = 0;
            let initOffsetY = 0;
            let initScale = 1.0;
            let initDist = 0;

            // Handle drag center (move/pan)
            transformBox.on('pointerdown', function (e) {
                if ($(e.target).hasClass('transform-handle')) return;
                isDraggingMove = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                initOffsetX = customOffsetX;
                initOffsetY = customOffsetY;
                transformBox[0].setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            // Handle drag corners (scale)
            transformBox.on('pointerdown', '.transform-handle', function (e) {
                e.stopPropagation();
                isDraggingHandle = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                initScale = customScale;

                const rect = transformBox[0].getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                initDist = Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1;
                this.setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            $(document).on('pointermove.rembgTransform', function (e) {
                if (isDraggingMove) {
                    const dx = e.clientX - dragStartX;
                    const dy = e.clientY - dragStartY;
                    customOffsetX = initOffsetX + dx;
                    customOffsetY = initOffsetY + dy;
                    updateTransformView();
                } else if (isDraggingHandle) {
                    const rect = transformBox[0].getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const currDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
                    const ratio = currDist / initDist;
                    customScale = Math.max(0.3, Math.min(3.5, parseFloat((initScale * ratio).toFixed(2))));
                    updateTransformView();
                }
            });

            $(document).on('pointerup.rembgTransform pointercancel.rembgTransform', function () {
                if (isDraggingMove || isDraggingHandle) {
                    isDraggingMove = false;
                    isDraggingHandle = false;
                    scheduleRecomposite();
                }
            });
        }

        /* ========================================================
           Cutout Person Interactive Transform & Drag Engine
           ======================================================== */
        function getNormalizedPersonOffsetX() {
            const vpW = cutoutViewport.width() || window.innerWidth;
            return vpW > 0 ? (personOffsetX / vpW) : 0;
        }

        function getNormalizedPersonOffsetY() {
            const vpH = cutoutViewport.height() || window.innerHeight;
            return vpH > 0 ? (personOffsetY / vpH) : 0;
        }

        function setPersonScale(val) {
            personScale = Math.max(0.2, Math.min(3.5, parseFloat(val.toFixed(2))));
            updatePersonTransformView();
            schedulePersonRecomposite();
        }

        function updatePersonTransformView() {
            // Apply scale & translation to cutout person layer in viewport
            if (cutoutPerson[0]) {
                cutoutPerson[0].style.setProperty(
                    'transform',
                    `translate(${personOffsetX}px, ${personOffsetY}px) scale(${personScale})`,
                    'important'
                );
                cutoutPerson[0].style.setProperty('transform-origin', 'center center', 'important');
            }

            // Calculate person image bounding box
            const vpW = cutoutViewport.width() || window.innerWidth;
            const vpH = cutoutViewport.height() || window.innerHeight;
            const img = personImg[0];
            const natW = (img && img.naturalWidth) || vpW;
            const natH = (img && img.naturalHeight) || vpH;
            const imgRatio = natW / natH;
            const vpRatio = vpW / vpH;

            let baseW, baseH;
            if (imgRatio > vpRatio) {
                baseW = vpW;
                baseH = vpW / imgRatio;
            } else {
                baseH = vpH;
                baseW = vpH * imgRatio;
            }

            const boxW = baseW * personScale;
            const boxH = baseH * personScale;
            const centerX = vpW / 2 + personOffsetX;
            const centerY = vpH / 2 + personOffsetY;

            personTransformBox.css({
                width: Math.round(boxW) + 'px',
                height: Math.round(boxH) + 'px',
                left: Math.round(centerX - boxW / 2) + 'px',
                top: Math.round(centerY - boxH / 2) + 'px'
            });

            lblPersonScaleVal.text(Math.round(personScale * 100) + '%');
        }

        function schedulePersonRecomposite() {
            if (personRecompositeTimer) clearTimeout(personRecompositeTimer);
            personRecompositeTimer = setTimeout(function () {
                if (currentTemplate && !isProcessingTemplate) {
                    const activeCard = grid.find('.rembg-template-card.active');
                    applyTemplateComposite(currentTemplate, activeCard.attr('data-name'), activeCard);
                }
            }, 350);
        }

        function bindPersonTransformGestures() {
            let isDraggingMove = false;
            let isDraggingHandle = false;
            let dragStartX = 0;
            let dragStartY = 0;
            let initOffsetX = 0;
            let initOffsetY = 0;
            let initScale = 1.0;
            let initDist = 0;

            // Handle drag center (move person)
            personTransformBox.on('pointerdown', function (e) {
                if ($(e.target).hasClass('person-transform-handle')) return;
                isDraggingMove = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                initOffsetX = personOffsetX;
                initOffsetY = personOffsetY;
                cutoutPerson.addClass('is-dragging');
                personTransformBox.addClass('is-active');
                this.setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            // Handle drag corners (scale person)
            personTransformBox.on('pointerdown', '.person-transform-handle', function (e) {
                e.stopPropagation();
                isDraggingHandle = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                initScale = personScale;

                const rect = personTransformBox[0].getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                initDist = Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1;
                cutoutPerson.addClass('is-dragging');
                personTransformBox.addClass('is-active');
                this.setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            $(document).on('pointermove.rembgPersonTransform', function (e) {
                if (isDraggingMove) {
                    const dx = e.clientX - dragStartX;
                    const dy = e.clientY - dragStartY;
                    personOffsetX = initOffsetX + dx;
                    personOffsetY = initOffsetY + dy;
                    updatePersonTransformView();
                } else if (isDraggingHandle) {
                    const rect = personTransformBox[0].getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const currDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
                    const ratio = currDist / initDist;
                    personScale = Math.max(0.2, Math.min(3.5, parseFloat((initScale * ratio).toFixed(2))));
                    updatePersonTransformView();
                }
            });

            $(document).on('pointerup.rembgPersonTransform pointercancel.rembgPersonTransform', function () {
                if (isDraggingMove || isDraggingHandle) {
                    isDraggingMove = false;
                    isDraggingHandle = false;
                    cutoutPerson.removeClass('is-dragging');
                    personTransformBox.removeClass('is-active');
                    schedulePersonRecomposite();
                }
            });
        }

        /* ========================================================
           Templates Management & Custom Upload
           ======================================================== */
        function loadTemplates() {
            $.ajax({
                url: 'api/getTemplates.php',
                type: 'GET',
                dataType: 'json'
            }).done(function (res) {
                if (res.success && res.templates) {
                    renderTemplates(res.templates);
                }
            });
        }

        function renderTemplates(templates) {
            grid.empty();
            templates.forEach(function (tpl) {
                const isSelected = (tpl.path === currentTemplate);
                const isCustom = (tpl.type === 'custom' || (tpl.path && tpl.path.indexOf('custom_') !== -1));

                const delBtnHtml = isCustom ? `
                    <button type="button" class="rembg-template-del-btn" data-path="${tpl.path}" title="删除此背景模板">
                        <i class="fa fa-trash-can"></i>
                    </button>
                ` : '';

                const item = $(`
                    <div class="rembg-template-card ${isSelected ? 'active' : ''}" data-path="${tpl.path}" data-name="${tpl.name}" data-type="${tpl.type || 'builtin'}">
                        <div class="rembg-thumb-wrap">
                            <img src="${tpl.thumbnail}" alt="${tpl.name}" loading="lazy" />
                            <div class="rembg-badge"><i class="fa fa-check"></i></div>
                            ${delBtnHtml}
                        </div>
                        <div class="rembg-template-name">${tpl.name}</div>
                    </div>
                `);

                grid.append(item);
            });
        }

        function uploadCustomTemplate(file) {
            const formData = new FormData();
            formData.append('template', file);

            const uploadBtn = $('#lblUploadTemplate');
            const originalText = uploadBtn.find('span').text();
            uploadBtn.find('span').text('上传中...');

            $.ajax({
                url: 'api/uploadTemplate.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            }).done(function (res) {
                uploadBtn.find('span').text(originalText);
                uploadInput.val('');
                if (res.success) {
                    const newCard = $(`
                        <div class="rembg-template-card active" data-path="${res.path}" data-name="自定义: ${res.name}" data-type="custom">
                            <div class="rembg-thumb-wrap">
                                <img src="${res.path}" alt="${res.name}" />
                                <div class="rembg-badge"><i class="fa fa-check"></i></div>
                                <button type="button" class="rembg-template-del-btn" data-path="${res.path}" title="删除此背景模板">
                                    <i class="fa fa-trash-can"></i>
                                </button>
                            </div>
                            <div class="rembg-template-name">自定义: ${res.name}</div>
                        </div>
                    `);
                    grid.prepend(newCard);
                    applyTemplateComposite(res.path, '自定义: ' + res.name, newCard);
                } else {
                    notifyRembg('error', res.error || '上传模板失败');
                }
            }).fail(function () {
                uploadBtn.find('span').text(originalText);
                uploadInput.val('');
                notifyRembg('error', '上传背景模板失败');
            });
        }

        function completeRembgAndApplyToStage() {
            if (recompositeTimer) {
                clearTimeout(recompositeTimer);
                recompositeTimer = null;
            }
            if (personRecompositeTimer) {
                clearTimeout(personRecompositeTimer);
                personRecompositeTimer = null;
            }

            if (isProcessingTemplate) {
                notifyRembg('info', '正在完成背景合成，请稍候...');
                let checkCount = 0;
                const waitInterval = setInterval(function () {
                    checkCount++;
                    if (!isProcessingTemplate || checkCount > 35) {
                        clearInterval(waitInterval);
                        finalizeStageReplacement();
                    }
                }, 100);
                return;
            }

            finalizeStageReplacement();
        }

        function finalizeStageReplacement() {
            const resultPage = $('.stage[data-stage="result"]');
            const finalFile = latestCompositeFile || resultPage.attr('data-img');

            if (!finalFile) {
                closeRembgDrawer();
                return;
            }

            // 1. Hide interactive transform controls and real-time cutout viewport
            modal.removeClass('active sidenav--open').hide();
            transformBox.hide();
            resizerBar.hide();
            personTransformBox.hide();
            personResizerBar.hide();
            cutoutViewport.hide();
            resultPage.removeClass('cutout-mode-active');

            // 2. Replace the image on the main result stage
            const finalUrl = '/data/images/' + finalFile + '?v=' + Date.now();
            resultPage.attr('data-img', finalFile);
            // CRITICAL: Set data-original-img to this new composite image!
            // Subsequent filter operations in filter menu will modify THIS image, NOT the raw camera photo!
            resultPage.attr('data-original-img', finalFile);
            resultPage.attr('data-matted-composite', finalFile);
            resultPage.css('--stage-background-image', 'url("' + finalUrl + '")');
            if (resultPage[0]) {
                resultPage[0].style.setProperty('--stage-background-image', 'url("' + finalUrl + '")');
                resultPage[0].style.setProperty('--stage-result-filter', 'none');
            }
            resultPage.css('--stage-result-filter', 'none');
            document.documentElement.style.setProperty('--stage-result-filter', 'none');

            resultPage.removeClass(function (index, className) {
                return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
            });
            cutoutViewport.removeClass(function (index, className) {
                return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
            });
            cutoutPerson.removeClass(function (index, className) {
                return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
            });
            if (cutoutViewport[0]) {
                cutoutViewport[0].style.removeProperty('filter');
            }
            if (cutoutPerson[0]) {
                cutoutPerson[0].style.removeProperty('filter');
            }

            // Reset active filter card back to "原图" (plain)
            $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
            $(`#filternav .filter-card[data-filter="plain"], #filternav .sidenav-list-item[data-filter="plain"]`).addClass('filter-card--active sidenav-list-item--active');

            if (window.photoBooth) {
                window.photoBooth.imgFilter = 'plain';
                window.photoBooth.filename = finalFile;
            }

            // 3. Update QR code on stage if visible
            const qrImg = document.querySelector('#resultQR img.stage-code__image');
            if (qrImg && window.environment && window.environment.publicFolders) {
                qrImg.src = window.environment.publicFolders.api + '/qrcode.php?filename=' + finalFile;
            }

            const imagesFolder = (window.environment && window.environment.publicFolders && window.environment.publicFolders.images)
                ? window.environment.publicFolders.images
                : '/data/images';
            const filterThumbUrl = imagesFolder + '/' + finalFile + '?v=' + Date.now();
            $('.filter-preview-img').each(function () {
                $(this).attr('src', filterThumbUrl);
            });

            if (window.photoBooth && typeof window.photoBooth.resetTimeOut === 'function') {
                window.photoBooth.resetTimeOut();
            }

            notifyRembg('success', '已替换为主界面成片，您可继续选择滤镜进行调整');
        }

        function closeRembgDrawer() {
            if (latestCompositeFile && latestCompositeFile !== baseOriginalName) {
                finalizeStageReplacement();
                return;
            }
            modal.removeClass('active sidenav--open').hide();
            transformBox.hide();
            resizerBar.hide();
            personTransformBox.hide();
            personResizerBar.hide();

            // Always hide real-time cutout viewport and restore stage background view
            cutoutViewport.hide();
            $('.stage[data-stage="result"]').removeClass('cutout-mode-active');

            if (window.photoBooth && typeof window.photoBooth.resetTimeOut === 'function') {
                window.photoBooth.resetTimeOut();
            }
        }

        /* Comprehensive cleanup and state reset when user takes a new picture */
        function cleanupRembg() {
            setMattingLoadingState(false);
            contourAnimationId++;
            cutoutRequestId++;
            cutoutState = 'idle';
            isCutoutExtracted = false;
            cutoutPngUrl = '';
            isProcessingTemplate = false;
            isCustomTemplateActive = false;
            currentTemplate = '';
            baseOriginalName = '';

            customScale = 1.0;
            customOffsetX = 0;
            customOffsetY = 0;
            if (recompositeTimer) {
                clearTimeout(recompositeTimer);
                recompositeTimer = null;
            }

            personScale = 1.0;
            personOffsetX = 0;
            personOffsetY = 0;
            isPersonActive = false;
            if (personRecompositeTimer) {
                clearTimeout(personRecompositeTimer);
                personRecompositeTimer = null;
            }

            // Hide and reset cutout person
            cutoutPerson.css('visibility', 'hidden').removeClass('is-lifted is-dragging');
            if (cutoutPerson[0]) {
                cutoutPerson[0].style.setProperty('transform', 'none', 'important');
            }
            personImg.attr('src', '');

            // Hide and reset background element
            cutoutBg.css({
                'background-image': 'none',
                'background-color': 'transparent',
                'transform': 'none'
            });
            if (cutoutBg[0]) {
                cutoutBg[0].style.setProperty('background-image', 'none', 'important');
                cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
            }

            // Clear contour canvas
            if (contourCanvas.length) {
                const contourContext = contourCanvas[0].getContext('2d');
                if (contourContext) {
                    contourContext.clearRect(0, 0, contourCanvas[0].width, contourCanvas[0].height);
                }
            }

            // Hide viewport & all transform controls
            cutoutViewport.removeClass(function (index, className) {
                return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
            });
            cutoutPerson.removeClass(function (index, className) {
                return (className.match(/(^|\s)filter-effect-\S+/g) || []).join(' ');
            });
            if (cutoutViewport[0]) {
                cutoutViewport[0].style.removeProperty('filter');
            }
            if (cutoutPerson[0]) {
                cutoutPerson[0].style.removeProperty('filter');
            }
            cutoutViewport.hide();
            transformBox.hide();
            resizerBar.hide();
            personTransformBox.hide();
            personResizerBar.hide();

            // Clear result stage cutout state and original image reference
            const resultPage = $('.stage[data-stage="result"]');
            resultPage.removeClass('cutout-mode-active');
            resultPage.removeAttr('data-original-img');

            // Close right drawer and reset card selections
            modal.removeClass('active sidenav--open').hide();
            grid.find('.rembg-template-card').removeClass('active is-locked is-loading');
            selectedNameEl.text('').hide();
        }

        // Expose globally so core.js can call it during api.reset() and api.renderPic()
        window.rembgReset = cleanupRembg;

        // Proactively bind to all buttons that trigger new capture, home, or retake
        $(document).off('click.rembgCleanup').on('click.rembgCleanup', '.takePic, .newpic, .takeCustom, .newcustom, .takeVideo, .newvideo, .newVideo, .homebtn, [data-command="homebtn"], [data-command="newpic"], [data-command="takePic"]', function () {
            cleanupRembg();
        });

        function revertToOriginal() {
            const resultPage = $('.stage[data-stage="result"]');
            const origCapture = resultPage.attr('data-camera-img') || baseOriginalName;
            if (!origCapture) return;

            contourAnimationId++;
            cutoutRequestId++;
            cutoutState = 'idle';
            isCutoutExtracted = false;
            cutoutPngUrl = '';
            latestCompositeFile = '';
            isProcessingTemplate = false;
            isCustomTemplateActive = false;
            personScale = 1.0;
            personOffsetX = 0;
            personOffsetY = 0;
            isPersonActive = false;

            cutoutPerson.css('visibility', 'hidden').removeClass('is-lifted is-dragging');
            if (cutoutPerson[0]) {
                cutoutPerson[0].style.setProperty('transform', 'none', 'important');
            }
            personImg.attr('src', '');
            cutoutBg.css({
                'background-image': 'none',
                'background-color': 'transparent',
                'transform': 'none'
            });
            if (cutoutBg[0]) {
                cutoutBg[0].style.setProperty('background-image', 'none', 'important');
                cutoutBg[0].style.setProperty('background-color', 'transparent', 'important');
            }

            if (contourCanvas.length) {
                const contourContext = contourCanvas[0].getContext('2d');
                if (contourContext) {
                    contourContext.clearRect(0, 0, contourCanvas[0].width, contourCanvas[0].height);
                }
            }

            cutoutViewport.hide();
            transformBox.hide();
            resizerBar.hide();
            personTransformBox.hide();
            personResizerBar.hide();

            resultPage.removeClass('cutout-mode-active');
            const origUrl = '/data/images/' + origCapture + '?v=' + Date.now();

            resultPage.attr('data-img', origCapture);
            resultPage.attr('data-original-img', origCapture);
            resultPage.removeAttr('data-matted-composite');
            resultPage.css('--stage-background-image', `url("${origUrl}")`);
            resultPage.css('--stage-result-filter', 'none');
            $('#stageCutoutPerson').css('filter', 'none');

            $('#filternav .filter-card, #filternav .sidenav-list-item, .filter-card, .sidenav-list-item').removeClass('filter-card--active sidenav-list-item--active focused');
            $(`#filternav .filter-card[data-filter="plain"], #filternav .sidenav-list-item[data-filter="plain"]`).addClass('filter-card--active sidenav-list-item--active');

            if (window.photoBooth) {
                photoBooth.filename = origCapture;
                photoBooth.imgFilter = 'plain';
            }

            const imagesFolder = (window.environment && window.environment.publicFolders && window.environment.publicFolders.images)
                ? window.environment.publicFolders.images
                : '/data/images';
            const filterThumbUrl = imagesFolder + '/' + origCapture + '?v=' + Date.now();
            $('.filter-preview-img').each(function () {
                $(this).attr('src', filterThumbUrl);
            });

            const qrImg = document.querySelector('#resultQR img.stage-code__image');
            if (qrImg && window.environment && window.environment.publicFolders) {
                qrImg.src = window.environment.publicFolders.api + '/qrcode.php?filename=' + origCapture;
            }

            currentTemplate = '';
            grid.find('.rembg-template-card').removeClass('active is-locked is-loading');
            modal.removeClass('active sidenav--open').hide();
            notifyRembg('info', '已还原为拍摄原图');
        }
        window.startMattingAndFlow = startMattingAndFlow;
    }

    $(document).ready(function () {
        initRembg();
    });
})(jQuery);
