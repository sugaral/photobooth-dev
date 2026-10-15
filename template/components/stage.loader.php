
<div class="stage stage--loader rotarygroup" data-stage="loader">
    <div class="stage-inner">
        <canvas id="video--sensor"></canvas>
        <div class="stage-image <?=$config['picture']['flip']?>"></div>
        <div class="stage-message"></div>
        <div class="buttonbar buttonbar--bottom"></div>

        <!-- AI 时空穿梭等待过渡特效 (Stage 3.4) -->
        <div id="aiShuttleOverlay" class="ai-shuttle-overlay" style="display:none;" aria-live="assertive">
            <div class="ai-shuttle-backdrop"></div>
            <div class="ai-shuttle-portal">
                <div class="ai-shuttle-ring ring-outer"></div>
                <div class="ai-shuttle-ring ring-middle"></div>
                <div class="ai-shuttle-ring ring-inner">
                    <i class="fa fa-wand-magic-sparkles"></i>
                </div>
                <div class="ai-shuttle-pulse"></div>
            </div>
            <div class="ai-shuttle-content">
                <div class="ai-shuttle-title">✨ 时空折跃变身中</div>
                <div class="ai-shuttle-ticker" id="aiShuttleTicker">
                    <span class="ai-ticker-step active"><i class="fa fa-crosshairs"></i> 正在定位面部 5 维几何关键点...</span>
                </div>
                <div class="ai-shuttle-progress-wrap">
                    <div class="ai-shuttle-progress-bar" id="aiShuttleProgressBar"></div>
                </div>
                <div class="ai-shuttle-tips">
                    <span>💡 RTX 5060 DirectML 硬件加速中 · 华服即将织就</span>
                </div>
            </div>
        </div>
    </div>
</div>
