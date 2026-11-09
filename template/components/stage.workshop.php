<section id="creativeWorkshop" class="workshop" hidden aria-labelledby="workshopTitle">
    <header class="workshop__header">
        <button type="button" class="workshop__button workshop__button--quiet" id="workshopBack"><i class="fa fa-arrow-left" aria-hidden="true"></i> <span>返回首页</span></button>
        <h1 id="workshopTitle" tabindex="-1">创意工坊</h1>
        <span class="workshop__paper-label">一张相纸，多个瞬间</span>
    </header>
    <div id="workshopSelection" class="workshop__selection">
        <div class="workshop__templates">
            <h2>先选一个喜欢的拼法</h2>
            <p class="workshop__muted">每个格子拍一张，每次快门前都有 3 秒准备时间。</p>
            <div id="workshopLayouts" class="workshop__layouts" role="group" aria-label="拼图模板"></div>
        </div>
        <aside class="workshop__selection-preview">
            <div id="workshopSelectedPaper" class="workshop__paper" aria-label="所选模板排版预览"></div>
            <h2 id="workshopSelectedName">经典四宫格</h2>
            <p id="workshopSelectedDescription" class="workshop__muted"></p>
            <p id="workshopSelectedSpec" class="workshop__spec">6 寸竖版 · 1200 × 1800 像素 · 完整矩形成片</p>
            <button type="button" id="workshopChoose" class="workshop__button workshop__button--primary">选好了，去拍摄 <i class="fa fa-arrow-right" aria-hidden="true"></i></button>
        </aside>
    </div>
    <div id="workshopCapture" class="workshop__capture" hidden>
        <!-- The existing studio is mounted here; controls and event handlers are shared. -->
        <div id="workshopCaptureTools" hidden>
            <div id="workshopPreviewSlot" aria-label="实时摄像头画面"></div>
            <div id="workshopCropGuide" aria-hidden="true"></div>
            <span id="workshopCountdown" class="workshop__countdown" hidden aria-hidden="true"></span>
            <div id="workshopFlash" class="workshop__flash" hidden></div>
            <div id="workshopProgress" class="workshop__progress">
            <div id="workshopProgressPaper" class="workshop__paper" aria-label="拍摄进度预览"></div>
            <div class="workshop__progress-copy">
                <div class="workshop__capture-heading"><strong id="workshopShotTitle">准备拍摄</strong><span id="workshopCounter">0 / 4</span></div>
                <p id="workshopProgressText">拍好的照片会出现在这里</p>
                <p id="workshopStatus" role="status" aria-live="polite">正在准备摄像头…</p>
                <button type="button" id="workshopRetry" class="workshop__button" hidden>重试</button>
                <button type="button" id="workshopChangeLayout" class="wb-reset-btn">更换拼图模板</button>
            </div>
            </div>
        </div>
    </div>
    <dialog id="workshopNotice" class="workshop__notice" aria-labelledby="workshopNoticeTitle" aria-describedby="workshopNoticeText">
        <i class="fa fa-camera-retro workshop__notice-icon" aria-hidden="true"></i>
        <h2 id="workshopNoticeTitle">此次拍摄会连续拍 4 次</h2>
        <p id="workshopNoticeText">每张照片前都会倒数 3、2、1。拍完一张后换个姿势，下一张会自动开始。</p>
        <p id="workshopCameraStatus" role="status">正在准备摄像头…</p>
        <div class="workshop__notice-actions">
            <button type="button" id="workshopNoticeBack" class="workshop__button workshop__button--quiet">重新选模板</button>
            <button type="button" id="workshopStart" class="workshop__button workshop__button--quiet"><i class="fa fa-wand-magic-sparkles"></i> 调整美颜/滤镜</button>
            <button type="button" id="workshopDirectShoot" class="workshop__button workshop__button--primary"><i class="fa fa-camera"></i> 开始拍摄</button>
        </div>
    </dialog>
</section>
<script type="application/json" id="workshopCatalog"><?= json_encode(\Photobooth\Service\WorkshopService::catalog(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?></script>
