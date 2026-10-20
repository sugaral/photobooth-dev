/* Render only frozen inputs. No live editor/DOM state is read here. */
(function (root) {
    'use strict';
    function loadImage(url, signal) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const cleanup = () => {
                img.onload = null;
                img.onerror = null;
                signal.removeEventListener('abort', abort);
            };
            const abort = () => {
                cleanup();
                img.src = '';
                reject(new Error('照片处理已取消'));
            };
            img.onload = () => {
                cleanup();
                resolve(img);
            };
            img.onerror = () => {
                cleanup();
                reject(new Error('照片或装饰素材加载失败，请重试'));
            };
            signal.addEventListener('abort', abort, { once: true });
            if (signal.aborted) {
                abort();
                return;
            }
            img.src = url;
        });
    }
    async function render(state, context) {
        const { signal, check } = context;
        const images = await Promise.all([
            loadImage(state.baseUrl, signal),
            state.frameUrl ? loadImage(state.frameUrl, signal) : null
        ]);
        const layerImages = await Promise.all(state.layers.map(layer => layer.asset ? loadImage(layer.asset, signal) : null));
        if (document.fonts) {
            await Promise.all(
                state.layers.filter(layer => !layer.asset).map((layer) =>
                    document.fonts.load(
                        layer.fontStyle + ' ' + layer.fontWeight + ' 32px ' + layer.fontFamily,
                        layer.content
                    )
                )
            );
            await document.fonts.ready;
        }
        check();
        const base = images[0];
        const width = base.naturalWidth,
            height = base.naturalHeight;
        if (width * height > 24000000 || width > 12000 || height > 12000) {
            throw new Error('照片超过当前编辑器的像素预算，请使用较小规格');
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('浏览器无法初始化绘图引擎');
            }
            if (state.filterCss !== 'none' && !('filter' in ctx)) {
                throw new Error('当前浏览器不支持所选滤镜导出');
            }
            ctx.filter = state.filterCss.replace(
                /([\d.]+)px/g,
                (match, value) => (Number(value) * height) / state.previewHeight + 'px'
            );
            let frameId = state.frame;
            if (!frameId && state.frameUrl && state.frameUrl.includes('frame-')) {
                const match = state.frameUrl.match(/frame-\d+/);
                if (match) frameId = match[0];
            }
            const geom = (images[1] && frameId && root.PhotoboothCatalog && typeof root.PhotoboothCatalog.frameGeometry === 'function')
                ? root.PhotoboothCatalog.frameGeometry(frameId, width, height)
                : { innerX: 0, innerY: 0, innerWidth: width, innerHeight: height };

            ctx.drawImage(base, geom.innerX, geom.innerY, geom.innerWidth, geom.innerHeight);
            ctx.filter = 'none';
            if (images[1]) {
                const frame = images[1];
                ctx.drawImage(frame, 0, 0, width, height);
            }
            for (const [index, layer] of state.layers.entries()) {
                check();
                ctx.save();
                ctx.translate(layer.x * width, layer.y * height);
                ctx.rotate((layer.rotation * Math.PI) / 180);
                if (layerImages[index]) {
                    const h = layer.fontSize * height, w = h * (layer.ratio || 1);
                    ctx.drawImage(layerImages[index], -w/2, -h/2, w, h);
                    ctx.restore();
                    continue;
                }
                const fontSize = layer.fontSize * height;
                ctx.font = layer.fontStyle + ' ' + layer.fontWeight + ' ' + fontSize + 'px ' + layer.fontFamily;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (layer.type === 'stamp') {
                    const bw = layer.width * width,
                        bh = layer.height * height,
                        radius = (6 * height) / state.previewHeight;
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    ctx.lineWidth = height / state.previewHeight;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, radius);
                    } else {
                        ctx.rect(-bw / 2, -bh / 2, bw, bh);
                    }
                    ctx.fill();
                    ctx.stroke();
                    if ('letterSpacing' in ctx) {
                        ctx.letterSpacing = layer.letterSpacing * height + 'px';
                    }
                }
                ctx.fillStyle = layer.color;
                if (layer.type === 'signature' || layer.type === 'stamp') {
                    ctx.shadowColor = 'rgba(0,0,0,0.65)';
                    ctx.shadowBlur = (8 * height) / state.previewHeight;
                    ctx.shadowOffsetY = (2 * height) / state.previewHeight;
                }
                ctx.fillText(layer.content, 0, 0);
                ctx.restore();
            }
            check();
            return await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    try {
                        check();
                        if (!blob) {
                            throw new Error('生成成片失败');
                        }
                        resolve(blob);
                    } catch (err) {
                        reject(err);
                    }
                }, 'image/png');
            });
        } finally {
            canvas.width = 0;
            canvas.height = 0;
        }
    }
    root.PhotoboothCompositeRenderer = { render };
})(globalThis);
