/* Shared, DOM-independent primitives for the post-capture editor. */
(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.PhotoboothEditSession = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }
    function freeze(value) {
        if (value && typeof value === 'object') {
            Object.values(value).forEach(freeze);
            Object.freeze(value);
        }
        return value;
    }
    function snapshot(value) {
        return freeze(clone(value));
    }
    function error(code, message) {
        const result = new Error(message);
        result.code = code;
        return result;
    }

    class History {
        constructor(limit = 25) {
            this.limit = limit;
            this.revision = 0;
            this.reset(null);
        }
        reset(value) {
            this.revision++;
            this.past = [];
            this.future = [];
            this.present = snapshot(value);
        }
        commit(value) {
            const next = snapshot(value);
            if (JSON.stringify(next) === JSON.stringify(this.present)) {
                return false;
            }
            if (this.present !== null) {
                this.past.push(this.present);
            }
            if (this.past.length > this.limit) {
                this.past.shift();
            }
            this.present = next;
            this.future = [];
            this.revision++;
            return true;
        }
        undo() {
            if (!this.past.length) {
                return null;
            }
            this.future.push(this.present);
            this.present = this.past.pop();
            this.revision++;
            return clone(this.present);
        }
        redo() {
            if (!this.future.length) {
                return null;
            }
            this.past.push(this.present);
            this.present = this.future.pop();
            this.revision++;
            return clone(this.present);
        }
    }

    // All callers of one operation receive the same promise. Cancellation and
    // timeout revoke the worker's right to publish, even if its I/O finishes late.
    class SaveCoordinator {
        constructor(timeoutMs = 30000) {
            this.timeoutMs = timeoutMs;
            this.epoch = 0;
            this.inflight = new Map();
            this.cache = new Map();
        }
        reset() {
            this.epoch++;
            for (const entry of this.inflight.values()) {
                entry.cancel(error('CANCELLED', '编辑会话已结束，请重新操作'));
            }
            this.inflight.clear();
            this.cache.clear();
        }
        invalidate() {
            this.reset();
        }
        run(key, document, worker) {
            if (this.cache.has(key)) {
                return Promise.resolve(this.cache.get(key));
            }
            if (this.inflight.has(key)) {
                return this.inflight.get(key).promise;
            }
            const frozen = snapshot(document);
            const epoch = this.epoch;
            const controller = new AbortController();
            let rejectCancellation;
            let timer;
            let cancelled = false;
            const cancellation = new Promise((resolve, reject) => {
                rejectCancellation = reject;
            });
            const entry = {
                cancel(reason) {
                    if (cancelled) {
                        return;
                    }
                    cancelled = true;
                    controller.abort();
                    rejectCancellation(reason);
                }
            };
            const check = () => {
                if (cancelled || epoch !== this.epoch) {
                    throw error('CANCELLED', '照片已修改，请重新领取当前成片');
                }
            };
            timer = setTimeout(
                () => entry.cancel(error('SAVE_TIMEOUT', '保存超时，结果尚未确认，请重试')),
                this.timeoutMs
            );
            const work = Promise.resolve().then(() => {
                check();
                return worker(frozen, { signal: controller.signal, check });
            });
            entry.promise = Promise.race([work, cancellation])
                .then((result) => {
                    check();
                    if (!result) {
                        throw error('EMPTY_RESULT', '保存未返回有效照片，未执行交付');
                    }
                    this.cache.set(key, result);
                    return result;
                })
                .finally(() => {
                    clearTimeout(timer);
                    if (this.inflight.get(key) === entry) {
                        this.inflight.delete(key);
                    }
                });
            this.inflight.set(key, entry);
            return entry.promise;
        }
    }

    function contain(width, height, viewport) {
        if (!(width > 0 && height > 0 && viewport.width > 0 && viewport.height > 0)) {
            throw error('INVALID_GEOMETRY', '照片显示区域尚未准备好');
        }
        const scale = Math.min(viewport.width / width, viewport.height / height);
        return {
            left: viewport.left + (viewport.width - width * scale) / 2,
            top: viewport.top + (viewport.height - height * scale) / 2,
            width: width * scale,
            height: height * scale,
            scale
        };
    }
    function pointToPhoto(x, y, rect) {
        return { x: (x - rect.left) / rect.width, y: (y - rect.top) / rect.height };
    }
    function normalizeAngle(angle) {
        return ((((angle + 180) % 360) + 360) % 360) - 180;
    }

    return { History, SaveCoordinator, snapshot, contain, pointToPhoto, normalizeAngle, error };
});
