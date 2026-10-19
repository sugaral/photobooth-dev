/* One color recipe for camera preview, editor preview and Canvas export. */
(function (root) {
    'use strict';
    const sample = 'resources/img/filter_model_thumb.jpg';
    const rows = [
        ['plain', '原图', '基础', 'none'],
        ['grayscale', '经典黑白', '黑白', 'grayscale(1)'],
        ['vintage', '复古胶片', '胶片', 'sepia(.35) contrast(1.25) saturate(1.15)'],
        ['antique', '旧日暖阳', '胶片', 'sepia(.65) contrast(.9) brightness(1.05) saturate(1.2)'],
        ['cool', '清冷', '清透', 'saturate(.8) hue-rotate(12deg) brightness(1.06)'],
        ['summer', '盛夏', '鲜艳', 'saturate(1.6) brightness(1.05) hue-rotate(-15deg)'],
        ['washed', '奶油日系', '清透', 'brightness(1.15) contrast(.85) saturate(.8)'],
        ['smooth', '柔和', '清透', 'contrast(.86) brightness(1.06) saturate(.92)'],
        ['pink', '樱粉', '氛围', 'sepia(.2) hue-rotate(320deg) saturate(1.3) brightness(1.08)'],
        ['blue', '蓝调', '氛围', 'sepia(.3) hue-rotate(175deg) saturate(1.3)'],
        ['amber', '琥珀', '暖色', 'sepia(.45) saturate(1.5) contrast(1.08)'],
        ['peach', '蜜桃', '暖色', 'sepia(.2) hue-rotate(340deg) saturate(1.2) brightness(1.12)'],
        ['honey', '蜂蜜', '暖色', 'sepia(.3) saturate(1.4) brightness(1.07)'],
        ['sunset', '落日', '暖色', 'sepia(.5) hue-rotate(345deg) saturate(1.5) contrast(1.12)'],
        ['cocoa', '可可', '暖色', 'sepia(.5) saturate(.8) brightness(.9) contrast(1.1)'],
        ['rose', '玫瑰', '氛围', 'sepia(.35) hue-rotate(315deg) saturate(1.3) contrast(1.05)'],
        ['lavender', '薰衣草', '氛围', 'sepia(.25) hue-rotate(230deg) saturate(1.4) brightness(1.08)'],
        ['mint', '薄荷', '清透', 'sepia(.2) hue-rotate(70deg) saturate(.9) brightness(1.12)'],
        ['ice', '冰川', '清透', 'sepia(.2) hue-rotate(160deg) saturate(.65) brightness(1.15) contrast(.95)'],
        ['forest', '森林', '氛围', 'sepia(.35) hue-rotate(60deg) saturate(.8) contrast(1.12)'],
        ['ocean', '深海', '氛围', 'sepia(.4) hue-rotate(155deg) saturate(1.2) brightness(.9)'],
        ['cinema', '电影', '胶片', 'contrast(1.25) saturate(.65) sepia(.12)'],
        ['noir', '黑色电影', '黑白', 'grayscale(1) contrast(1.5) brightness(.9)'],
        ['silver', '银盐', '黑白', 'grayscale(1) contrast(1.12) brightness(1.12)'],
        ['matte', '哑光黑白', '黑白', 'grayscale(1) contrast(.7) brightness(1.08)'],
        ['sepia', '怀旧棕', '胶片', 'sepia(1) contrast(1.1)'],
        ['retro', '港风', '胶片', 'sepia(.45) contrast(1.2) brightness(.95) saturate(1.1)'],
        ['fade', '褪色记忆', '胶片', 'sepia(.25) contrast(.75) saturate(.65) brightness(1.1)'],
        ['polaroid', '拍立得', '胶片', 'sepia(.15) contrast(1.15) saturate(.85) brightness(1.08)'],
        ['pop', '波普', '鲜艳', 'contrast(1.2) saturate(1.9)'],
        ['citrus', '柑橘', '鲜艳', 'sepia(.3) hue-rotate(15deg) saturate(1.7) brightness(1.1)'],
        ['cherry', '樱桃', '鲜艳', 'sepia(.2) hue-rotate(330deg) saturate(1.8) contrast(1.12)'],
        ['emerald', '翡翠', '鲜艳', 'sepia(.35) hue-rotate(90deg) saturate(1.6) contrast(1.15)'],
        ['neon', '霓虹', '鲜艳', 'hue-rotate(275deg) saturate(1.8) contrast(1.25)'],
        ['moon', '月光', '氛围', 'saturate(.45) brightness(.9) contrast(1.2) sepia(.12)'],
        ['bright', '晴空', '清透', 'brightness(1.18) contrast(1.06) saturate(1.1)'],
        ['quiet', '静谧', '清透', 'saturate(.55) contrast(.95) brightness(1.04)']
    ];
    const filters = rows.map(([id, name, category, css]) => Object.freeze({ id, name, category, css }));
    const filterMap = Object.freeze(Object.fromEntries(filters.map(f => [f.id, f.css])));
    const frameNames = ['纯白留影', '黑色画廊', '金色双线', '银色双线', '樱花圆角', '薄荷圆角', '奶油相纸', '落日相纸', '天空虚线', '莓果虚线', '胶片齿孔', '黑白齿孔', '星光角饰', '月夜角饰', '花语', '春芽', '糖果波点', '海盐波点', '复古斜纹', '珊瑚斜纹', '典雅四角', '冰蓝四角', '彩虹阶梯', '暮色阶梯'];
    const colors = ['#ffffff','#171923','#d4a853','#a7b4c4','#f29fb0','#78bda8','#fff3d6','#edb083','#83bbdf','#cb789e','#202534','#ece5dc','#f4c75a','#728dc9','#f6a4b8','#78aa86','#e495ba','#78c9d3','#ba8a59','#e2947c','#d6bd84','#9ac2d7','#eaa4cb','#a99cce'];
    const frames = frameNames.map((name, i) => Object.freeze({id:'frame-' + (i + 1), name, color:colors[i], pattern:Math.floor(i / 2)}));
    const svgUrl = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    function frameSvg(id, width, height) {
        const f = frames.find(item => item.id === id);
        if (!f) throw new Error('边框不存在，请重新选择');
        const w = Math.round(width), h = Math.round(height), u = Math.min(w,h) / 100;
        let shapes = `<rect x="${u}" y="${u}" width="${w-2*u}" height="${h-2*u}" rx="${f.pattern===2?6*u:0}" fill="none" stroke="${f.color}" stroke-width="${f.pattern===3?5*u:2*u}" ${f.pattern===4?`stroke-dasharray="${3*u} ${2*u}"`:''}/>`;
        if ([1,3,10,11].includes(f.pattern)) shapes += `<rect x="${4*u}" y="${4*u}" width="${w-8*u}" height="${h-8*u}" fill="none" stroke="${f.color}" stroke-width="${.5*u}"/>`;
        if (f.pattern===3) shapes += `<rect x="0" y="${h-9*u}" width="${w}" height="${9*u}" fill="${f.color}"/>`;
        if (f.pattern>=5) {
            for (let x=6*u; x<w-4*u; x+=8*u) {
                for (const y of [2*u,h-2*u]) {
                    if (f.pattern===5) shapes += `<rect x="${x}" y="${y-u}" width="${2*u}" height="${2*u}" rx="${u/3}" fill="${f.color}"/>`;
                    else if ([8,9,11].includes(f.pattern)) shapes += `<path d="M${x-u},${y-u} l${2*u},${2*u}" stroke="${f.color}" stroke-width="${u}"/>`;
                    else shapes += `<circle cx="${x}" cy="${y}" r="${u}" fill="${f.color}"/>`;
                }
            }
            if ([6,7,10].includes(f.pattern)) for (const [x,y] of [[5*u,5*u],[w-5*u,5*u],[5*u,h-5*u],[w-5*u,h-5*u]]) shapes += `<path d="M${x-3*u},${y} Q${x},${y-7*u} ${x+3*u},${y} Q${x},${y+7*u} ${x-3*u},${y}Z" fill="${f.color}"/>`;
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shapes}</svg>`;
    }
    root.PhotoboothCatalog = Object.freeze({filters, filterMap, frames, sample, svgUrl, frameSvg});
    if (typeof module === 'object') module.exports = root.PhotoboothCatalog;
})(globalThis);
