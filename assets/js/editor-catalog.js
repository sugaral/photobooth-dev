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

    function frameGeometry(id, width, height) {
        const f = frames.find(item => item.id === id);
        const w = Math.round(width), h = Math.round(height);
        if (!f) {
            return {
                innerX: 0,
                innerY: 0,
                innerWidth: w,
                innerHeight: h,
                padLeft: 0,
                padTop: 0,
                padRight: 0,
                padBottom: 0,
                u: Math.min(w, h) / 100
            };
        }
        const u = Math.min(w, h) / 100;
        const isPolaroid = f.pattern === 3;
        // Keep exact aspect ratio so photo is 100% undistorted and 0% covered
        const scale = isPolaroid ? 0.84 : 0.90;
        const innerWidth = Math.max(1, Math.round(w * scale));
        const innerHeight = Math.max(1, Math.round(h * scale));
        const innerX = Math.round((w - innerWidth) / 2);
        const innerY = isPolaroid ? Math.round(h * 0.05) : Math.round((h - innerHeight) / 2);
        const padBottom = h - innerY - innerHeight;

        return {
            innerX,
            innerY,
            innerWidth,
            innerHeight,
            padLeft: innerX,
            padTop: innerY,
            padRight: w - innerX - innerWidth,
            padBottom,
            u
        };
    }

    function frameSvg(id, width, height, isThumb) {
        const f = frames.find(item => item.id === id);
        if (!f) throw new Error('边框不存在，请重新选择');
        const geom = frameGeometry(id, width, height);
        const { innerX, innerY, innerWidth, innerHeight, u } = geom;
        const w = Math.round(width), h = Math.round(height);

        const darkPalettes = {
            'frame-2': { bg: '#171923', accent: '#E2E8F0', stroke: 'rgba(255,255,255,0.22)' },
            'frame-4': { bg: '#1A1D24', accent: '#C5D1DE', stroke: 'rgba(255,255,255,0.22)' },
            'frame-11': { bg: '#181A20', accent: '#F3F4F6', stroke: 'rgba(255,255,255,0.25)' },
            'frame-13': { bg: '#131620', accent: '#F59E0B', stroke: 'rgba(255,255,255,0.18)' },
            'frame-14': { bg: '#151D2C', accent: '#93C5FD', stroke: 'rgba(255,255,255,0.18)' },
            'frame-21': { bg: '#1E1B18', accent: '#D4AF37', stroke: 'rgba(255,255,255,0.2)' },
            'frame-22': { bg: '#131E2A', accent: '#7DD3FC', stroke: 'rgba(255,255,255,0.2)' },
            'frame-24': { bg: '#1E192B', accent: '#C084FC', stroke: 'rgba(255,255,255,0.2)' }
        };

        const lightPalettes = {
            'frame-1': { bg: '#FFFFFF', accent: '#111827', stroke: 'rgba(0,0,0,0.15)' },
            'frame-3': { bg: '#FDFBF7', accent: '#D4A853', stroke: 'rgba(0,0,0,0.1)' },
            'frame-5': { bg: '#FFF1F3', accent: '#F472B6', stroke: 'rgba(0,0,0,0.08)' },
            'frame-6': { bg: '#F0FDF9', accent: '#34D399', stroke: 'rgba(0,0,0,0.08)' },
            'frame-7': { bg: '#FDFCF7', accent: '#374151', stroke: 'rgba(0,0,0,0.12)' },
            'frame-8': { bg: '#FFF7F2', accent: '#FB923C', stroke: 'rgba(0,0,0,0.1)' },
            'frame-9': { bg: '#F0F9FF', accent: '#38BDF8', stroke: 'rgba(0,0,0,0.08)' },
            'frame-10': { bg: '#FDF2F8', accent: '#EC4899', stroke: 'rgba(0,0,0,0.08)' },
            'frame-12': { bg: '#EFECE6', accent: '#1F2937', stroke: 'rgba(0,0,0,0.15)' },
            'frame-15': { bg: '#FFF5F7', accent: '#FB7185', stroke: 'rgba(0,0,0,0.08)' },
            'frame-16': { bg: '#F2FBF5', accent: '#4ADE80', stroke: 'rgba(0,0,0,0.08)' },
            'frame-17': { bg: '#FDF4F9', accent: '#F472B6', stroke: 'rgba(0,0,0,0.08)' },
            'frame-18': { bg: '#F0FDFA', accent: '#2DD4BF', stroke: 'rgba(0,0,0,0.08)' },
            'frame-19': { bg: '#FAF6F0', accent: '#B45309', stroke: 'rgba(0,0,0,0.1)' },
            'frame-20': { bg: '#FFF6F4', accent: '#F87171', stroke: 'rgba(0,0,0,0.08)' },
            'frame-23': { bg: '#FAF8FC', accent: '#E879F9', stroke: 'rgba(0,0,0,0.08)' }
        };

        const pal = darkPalettes[f.id] || lightPalettes[f.id] || { bg: f.color || '#FFFFFF', accent: '#111827', stroke: 'rgba(0,0,0,0.12)' };
        const isDark = !!darkPalettes[f.id];

        // 1. Mat background with empty cutout for the photo
        const matPath = `M0,0 L${w},0 L${w},${h} L0,${h} Z M${innerX},${innerY} L${innerX + innerWidth},${innerY} L${innerX + innerWidth},${innerY + innerHeight} L${innerX},${innerY + innerHeight} Z`;

        let shapes = `<path d="${matPath}" fill="${pal.bg}" fill-rule="evenodd"/>`;

        // If rendering thumbnail for drawer, fill photo aperture with light gray so the mat is obvious
        if (isThumb) {
            shapes += `<rect x="${innerX}" y="${innerY}" width="${innerWidth}" height="${innerHeight}" fill="${isDark ? '#2D3748' : '#F1F5F9'}"/>`;
        }

        // Inner aperture border (bordering the photo without covering it)
        shapes += `<rect x="${innerX}" y="${innerY}" width="${innerWidth}" height="${innerHeight}" fill="none" stroke="${pal.stroke}" stroke-width="${Math.max(1, Math.round(0.18 * u))}"/>`;

        // Outer canvas border
        shapes += `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}" stroke-width="1"/>`;

        // Pattern-specific decorative details strictly inside outer mat:
        if (f.pattern === 1) { // 金色双线 / 银色双线
            const m1x = Math.round(innerX * 0.35), m1y = Math.round(innerY * 0.35);
            const m2x = Math.round(innerX * 0.65), m2y = Math.round(innerY * 0.65);
            shapes += `<rect x="${m1x}" y="${m1y}" width="${w - 2 * m1x}" height="${h - 2 * m1y}" fill="none" stroke="${pal.accent}" stroke-width="${Math.max(1.5, Math.round(0.25 * u))}"/>`;
            shapes += `<rect x="${m2x}" y="${m2y}" width="${w - 2 * m2x}" height="${h - 2 * m2y}" fill="none" stroke="${pal.accent}" stroke-width="${Math.max(1, Math.round(0.12 * u))}"/>`;
        } else if (f.pattern === 2) { // 樱花圆角 / 薄荷圆角
            const cr = Math.max(2, Math.round(0.4 * u));
            const corners = [
                [Math.round(innerX * 0.5), Math.round(innerY * 0.5)],
                [w - Math.round(innerX * 0.5), Math.round(innerY * 0.5)],
                [Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)],
                [w - Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)]
            ];
            for (const [cx, cy] of corners) {
                shapes += `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${pal.accent}"/>`;
            }
            const midX = Math.round(innerX * 0.5), midY = Math.round(innerY * 0.5);
            shapes += `<rect x="${midX}" y="${midY}" width="${w - 2 * midX}" height="${h - 2 * midY}" rx="${Math.round(2 * u)}" fill="none" stroke="${pal.accent}" stroke-width="${Math.max(1, Math.round(0.15 * u))}" stroke-opacity="0.6"/>`;
        } else if (f.pattern === 3) { // 奶油相纸 / 落日相纸 (Polaroid style)
            const bottomAreaH = h - innerY - innerHeight;
            const lineY = innerY + innerHeight + Math.round(bottomAreaH * 0.22);
            shapes += `<line x1="${innerX}" y1="${lineY}" x2="${innerX + innerWidth}" y2="${lineY}" stroke="${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}" stroke-width="1"/>`;
            const textY = innerY + innerHeight + Math.round(bottomAreaH * 0.65);
            const fontSize = Math.max(9, Math.round(0.85 * u));
            shapes += `<text x="${w / 2}" y="${textY}" text-anchor="middle" font-family="'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif" font-size="${fontSize}" font-weight="700" fill="${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'}" letter-spacing="${Math.round(0.15 * u)}">PHOTOBOOTH · MEMORY</text>`;
        } else if (f.pattern === 4) { // 天空虚线 / 莓果虚线
            const midX = Math.round(innerX * 0.5), midY = Math.round(innerY * 0.5);
            const dash = Math.max(4, Math.round(0.8 * u));
            shapes += `<rect x="${midX}" y="${midY}" width="${w - 2 * midX}" height="${h - 2 * midY}" fill="none" stroke="${pal.accent}" stroke-width="${Math.max(1.5, Math.round(0.22 * u))}" stroke-dasharray="${dash} ${dash * 0.75}"/>`;
        } else if (f.pattern === 5) { // 胶片齿孔 / 黑白齿孔 (35mm film)
            const sw = Math.max(7, Math.round(1.1 * u));
            const sh = Math.max(9, Math.round(1.4 * u));
            const step = Math.round(sw * 2.3);
            const topY = Math.round((innerY - sh) / 2);
            const botY = innerY + innerHeight + Math.round((h - innerY - innerHeight - sh) / 2);
            for (let x = innerX; x <= innerX + innerWidth - sw; x += step) {
                shapes += `<rect x="${x}" y="${topY}" width="${sw}" height="${sh}" rx="${Math.round(sw * 0.2)}" fill="${pal.accent}" opacity="0.88"/>`;
                shapes += `<rect x="${x}" y="${botY}" width="${sw}" height="${sh}" rx="${Math.round(sw * 0.2)}" fill="${pal.accent}" opacity="0.88"/>`;
            }
        } else if (f.pattern === 6) { // 星光角饰 / 月夜角饰
            const sr = Math.max(5, Math.round(1.0 * u));
            const corners = [
                [Math.round(innerX * 0.5), Math.round(innerY * 0.5)],
                [w - Math.round(innerX * 0.5), Math.round(innerY * 0.5)],
                [Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)],
                [w - Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)]
            ];
            for (const [cx, cy] of corners) {
                shapes += `<path d="M${cx},${cy - sr} Q${cx},${cy} ${cx + sr},${cy} Q${cx},${cy} ${cx},${cy + sr} Q${cx},${cy} ${cx - sr},${cy} Q${cx},${cy} ${cx},${cy - sr} Z" fill="${pal.accent}"/>`;
            }
        } else if (f.pattern === 7) { // 花语 / 春芽
            const fr = Math.max(2.5, Math.round(0.35 * u));
            const corners = [
                [Math.round(innerX * 0.5), Math.round(innerY * 0.5)],
                [w - Math.round(innerX * 0.5), Math.round(innerY * 0.5)],
                [Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)],
                [w - Math.round(innerX * 0.5), h - Math.round(innerY * 0.5)]
            ];
            for (const [cx, cy] of corners) {
                shapes += `<circle cx="${cx - fr}" cy="${cy}" r="${fr}" fill="${pal.accent}" opacity="0.8"/>`;
                shapes += `<circle cx="${cx + fr}" cy="${cy}" r="${fr}" fill="${pal.accent}" opacity="0.8"/>`;
                shapes += `<circle cx="${cx}" cy="${cy - fr}" r="${fr}" fill="${pal.accent}" opacity="0.8"/>`;
                shapes += `<circle cx="${cx}" cy="${cy + fr}" r="${fr}" fill="${pal.accent}" opacity="0.8"/>`;
                shapes += `<circle cx="${cx}" cy="${cy}" r="${fr * 0.55}" fill="${isDark ? '#FFFFFF' : '#FFD93D'}"/>`;
            }
        } else if (f.pattern === 8) { // 糖果波点 / 海盐波点
            const dotR = Math.max(2, Math.round(0.25 * u));
            const step = Math.max(12, Math.round(1.8 * u));
            const topY = Math.round(innerY * 0.5);
            const botY = innerY + innerHeight + Math.round((h - innerY - innerHeight) * 0.5);
            for (let x = innerX + Math.round(step * 0.5); x < innerX + innerWidth; x += step) {
                shapes += `<circle cx="${x}" cy="${topY}" r="${dotR}" fill="${pal.accent}"/>`;
                shapes += `<circle cx="${x}" cy="${botY}" r="${dotR}" fill="${pal.accent}"/>`;
            }
        } else if (f.pattern === 9) { // 复古斜纹 / 珊瑚斜纹
            const step = Math.max(10, Math.round(1.5 * u));
            const strokeW = Math.max(1, Math.round(0.18 * u));
            const topY = Math.round(innerY * 0.5);
            const botY = innerY + innerHeight + Math.round((h - innerY - innerHeight) * 0.5);
            for (let x = innerX; x <= innerX + innerWidth - step; x += step) {
                shapes += `<line x1="${x}" y1="${topY - Math.round(0.5 * u)}" x2="${x + Math.round(0.8 * u)}" y2="${topY + Math.round(0.5 * u)}" stroke="${pal.accent}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
                shapes += `<line x1="${x}" y1="${botY - Math.round(0.5 * u)}" x2="${x + Math.round(0.8 * u)}" y2="${botY + Math.round(0.5 * u)}" stroke="${pal.accent}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
            }
        } else if (f.pattern === 10) { // 典雅四角 / 冰蓝四角
            const arm = Math.max(10, Math.round(1.8 * u));
            const strokeW = Math.max(1.5, Math.round(0.25 * u));
            const mX = Math.round(innerX * 0.4), mY = Math.round(innerY * 0.4);
            shapes += `<path d="M${mX},${mY + arm} L${mX},${mY} L${mX + arm},${mY}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}"/>`;
            shapes += `<path d="M${w - mX - arm},${mY} L${w - mX},${mY} L${w - mX},${mY + arm}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}"/>`;
            shapes += `<path d="M${mX},${h - mY - arm} L${mX},${h - mY} L${mX + arm},${h - mY}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}"/>`;
            shapes += `<path d="M${w - mX - arm},${h - mY} L${w - mX},${h - mY} L${w - mX},${h - mY - arm}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}"/>`;
        } else if (f.pattern === 11) { // 彩虹阶梯 / 暮色阶梯
            const strokeW = Math.max(1, Math.round(0.18 * u));
            for (let step = 1; step <= 3; step++) {
                const off = step * Math.round(0.35 * u);
                const arm = Math.max(6, Math.round(1.4 * u)) - step * Math.round(0.25 * u);
                const mX = Math.round(innerX * 0.3) + off, mY = Math.round(innerY * 0.3) + off;
                shapes += `<path d="M${mX},${mY + arm} L${mX},${mY} L${mX + arm},${mY}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}" opacity="${1 - step * 0.2}"/>`;
                shapes += `<path d="M${w - mX - arm},${mY} L${w - mX},${mY} L${w - mX},${mY + arm}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}" opacity="${1 - step * 0.2}"/>`;
                shapes += `<path d="M${mX},${h - mY - arm} L${mX},${h - mY} L${mX + arm},${h - mY}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}" opacity="${1 - step * 0.2}"/>`;
                shapes += `<path d="M${w - mX - arm},${h - mY} L${w - mX},${h - mY} L${w - mX},${h - mY - arm}" fill="none" stroke="${pal.accent}" stroke-width="${strokeW}" opacity="${1 - step * 0.2}"/>`;
            }
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shapes}</svg>`;
    }
    root.PhotoboothCatalog = Object.freeze({filters, filterMap, frames, sample, svgUrl, frameSvg, frameGeometry});
    if (typeof module === 'object') module.exports = root.PhotoboothCatalog;
})(globalThis);
