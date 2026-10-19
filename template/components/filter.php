<?php

use Photobooth\Enum\ImageFilterEnum;
use Photobooth\Service\LanguageService;

$languageService = LanguageService::getInstance();

$filterLabels = [
    'plain' => '原图',
    'grayscale' => '经典黑白',
    'antique' => '复古暖调',
    'vintage' => '经典胶片',
    'retro' => '怀旧质感',
    'cool' => '冷艳冷调',
    'summer' => '夏日艳阳',
    'sepia-light' => '浅褐暖阳',
    'sepia-dark' => '深褐岁月',
    'color' => '鲜艳增强',
    'washed' => '清透浅淡',
    'everglow' => '暖金夕照',
    'aqua' => '水波淡蓝',
    'blue' => '夜色幽蓝',
    'green' => '森林青绿',
    'red' => '暖烈红韵',
    'pink' => '浪漫粉黛',
    'yellow' => '金黄明媚',
    'smooth' => '柔焦微光',
    'blur' => '朦胧虚化',
    'selective-blur' => '径向虚化',
    'pixelate' => '像素马赛克',
    'negate' => '反色艺术',
    'emboss' => '金属浮雕',
    'edge' => '素描轮廓',
    'mean' => '对比增强',
];

?>
<div id="filternav" class="sidenav filternav-drawer rotarygroup">
    <div class="filternav-header">
        <div class="filternav-title">
            <i class="<?php echo $config['icons']['filter'] ?? 'fa fa-wand-magic-sparkles'; ?>"></i>
            <span>选择滤镜效果</span>
        </div>
        <button
            type="button"
            class="filternav-close-btn rotaryfocus"
            data-command="sidenav-close"
            title="<?=$languageService->translate('close')?>"
        >
            <i class="<?php echo $config['icons']['close'] ?? 'fa fa-times'; ?>"></i>
        </button>
    </div>
    
    <div class="filternav-scrollable-list dragscroll">
        <?php foreach (ImageFilterEnum::cases() as $filter): ?>
            <?php if (!in_array($filter, $config['filters']['disabled'])): ?>
                <?php 
                    $fVal = $filter->value;
                    $fName = $filterLabels[$fVal] ?? $filter->label();
                    $defaultFilter = $config['filters']['defaults'] ?? null;
                    $defaultVal = is_object($defaultFilter) && isset($defaultFilter->value) ? $defaultFilter->value : (string)$defaultFilter;
                    $isActive = ($defaultVal === $fVal || $defaultFilter === $filter);
                ?>
                <div
                    class="filter-card sidenav-list-item<?= $isActive ? ' filter-card--active sidenav-list-item--active' : ''; ?> rotaryfocus"
                    data-filter="<?= $fVal ?>"
                >
                    <div class="filter-card-thumb">
                        <img
                            src="resources/img/filter_model_thumb.jpg"
                            alt="<?= $fName ?>"
                            class="filter-preview-img filter-effect-<?= $fVal ?>"
                            loading="lazy"
                        />
                        <div class="filter-card-badge"><i class="fa fa-check"></i></div>
                    </div>
                    <div class="filter-card-label"><?= $fName ?></div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
</div>
