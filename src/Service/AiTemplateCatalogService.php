<?php

namespace Photobooth\Service;

/** Only real, catalogued files inside the template directory may enter the inference service. */
final class AiTemplateCatalogService
{
    public function __construct(private ?string $root = null)
    {
        $this->root ??= dirname(__DIR__, 2);
    }

    public function all(): array
    {
        $rows = [];
        foreach (['resources/catalog/ai-templates.json', 'data/ai_templates_custom.json'] as $file) {
            $path = $this->root . '/' . $file;
            if (!is_file($path)) continue;
            try {
                $records = str_starts_with($file, 'data/')
                    ? $this->withCustomLock(fn () => $this->readCustom(), false)
                    : json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
            } catch (\Throwable) {
                continue;
            }
            foreach (is_array($records) ? $records : [] as $record) {
                if (!is_array($record) || ($record['enabled'] ?? true) !== true || ($record['quality_status'] ?? '') === 'rejected') continue;
                $relative = $record['image'] ?? $record['thumb'] ?? '';
                if (!isset($record['id']) || !$this->safePath($relative)) continue;
                $record['image'] = $relative;
                $record['thumb'] = $this->safePath($record['thumb'] ?? '') ? $record['thumb'] : $relative;
                $record['age_band'] ??= 'unspecified';
                $record['sex_code'] ??= 'unisex';
                $record['category'] ??= 'custom';
                $record['is_custom'] = $record['category'] === 'custom';
                $rows[$record['id']] = $record;
            }
        }
        $templatesDir = realpath($this->root . '/resources/img/templates_ai');
        if ($templatesDir && is_dir($templatesDir)) {
            // Collect scan targets: root directory and its subdirectories (man, woman, custom, etc.)
            $targets = [['dir' => $templatesDir, 'sub' => '']];
            $entries = scandir($templatesDir);
            foreach ($entries as $e) {
                if ($e === '.' || $e === '..') continue;
                $full = $templatesDir . DIRECTORY_SEPARATOR . $e;
                if (is_dir($full)) {
                    $targets[] = ['dir' => $full, 'sub' => $e];
                }
            }

            // Existing images mapped to prevent duplicates
            $knownImages = [];
            foreach ($rows as $r) {
                $knownImages[basename($r['image'])] = true;
            }

            foreach ($targets as $target) {
                $sub = $target['sub'];
                $dir = $target['dir'];
                $isMan = in_array(strtolower($sub), ['man', 'male', 'nan'], true);
                $isWoman = in_array(strtolower($sub), ['woman', 'female', 'nv'], true);
                $sexCode = $isMan ? 'male' : ($isWoman ? 'female' : 'unisex');
                $sexText = $isMan ? '男士' : ($isWoman ? '女士' : '通用');

                // Load subfolder manifest if present
                $manifestMap = [];
                $manifestFile = $dir . DIRECTORY_SEPARATOR . '_manifest.json';
                if (is_file($manifestFile)) {
                    try {
                        $mJson = json_decode(file_get_contents($manifestFile), true, 512, JSON_THROW_ON_ERROR);
                        if (is_array($mJson)) {
                            foreach ($mJson as $th) {
                                $thName = $th['name'] ?? '';
                                $thCat = $th['category'] ?? '';
                                $thTheme = $th['theme'] ?? '';
                                foreach ($th['files'] ?? [] as $idx => $fn) {
                                    $manifestMap[$fn] = [
                                        'name' => $thName . (count($th['files'] ?? []) > 1 ? ' ' . sprintf('%02d', $idx + 1) : ''),
                                        'tag' => $thName ?: ($isMan ? '男士写真' : ($isWoman ? '女士写真' : '写真模板')),
                                        'category' => $thCat ?: ($isMan ? 'man' : ($isWoman ? 'woman' : 'custom')),
                                    ];
                                }
                            }
                        }
                    } catch (\Throwable) {}
                }

                $files = scandir($dir);
                foreach ($files as $f) {
                    if ($f === '.' || $f === '..' || is_dir($dir . DIRECTORY_SEPARATOR . $f)) continue;
                    if (str_contains($f, '-thumb.')) continue;
                    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
                    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) continue;

                    if (isset($knownImages[$f])) continue;

                    $id = ($sub ? $sub . '_' : '') . pathinfo($f, PATHINFO_FILENAME);
                    if (isset($rows[$id])) continue;

                    $rel = 'resources/img/templates_ai/' . ($sub ? $sub . '/' : '') . $f;
                    $meta = $manifestMap[$f] ?? null;

                    // Fallback category detection
                    $cat = $meta['category'] ?? '';
                    if (!$cat) {
                        $low = strtolower($f);
                        if (preg_match('#fairy|immortal|hanfu|emperor|consort|scholar|tang|wuxia|swordsman|ink|assassin|general|plum|flower#', $low)) {
                            $cat = 'hanfu';
                        } elseif (str_contains($low, 'cyber')) {
                            $cat = 'cyberpunk';
                        } elseif (preg_match('#school|campus#', $low)) {
                            $cat = 'school';
                        } elseif (str_contains($low, 'wedding')) {
                            $cat = 'wedding';
                        } elseif (preg_match('#qipao|republican|vintage#', $low)) {
                            $cat = 'vintage';
                        } else {
                            $cat = $isMan ? 'man' : ($isWoman ? 'woman' : 'custom');
                        }
                    }

                    $title = $meta['name'] ?? pathinfo($f, PATHINFO_FILENAME);
                    $tag = $meta['tag'] ?? ($isMan ? '男士写真' : ($isWoman ? '女士写真' : '写真模板'));

                    $rows[$id] = [
                        'id' => $id,
                        'title' => $title,
                        'category' => $cat,
                        'sex' => $sexText,
                        'sex_code' => $sexCode,
                        'age_band' => '18-29',
                        'tag' => $tag,
                        'image' => $rel,
                        'thumb' => $rel,
                        'is_custom' => false,
                        'enabled' => true,
                    ];
                    $knownImages[$f] = true;
                }
            }
        }
        return array_values($rows);
    }

    public function resolve(string $idOrPath): string
    {
        $idOrPathClean = ltrim(str_replace('\\', '/', $idOrPath), '/');
        $baseName = basename($idOrPathClean);
        $fnNoExt = pathinfo($baseName, PATHINFO_FILENAME);

        foreach ($this->all() as $record) {
            $recImg = ltrim(str_replace('\\', '/', $record['image']), '/');
            if ($record['id'] === $idOrPath
                || $recImg === $idOrPathClean
                || basename($recImg) === $baseName
                || pathinfo($recImg, PATHINFO_FILENAME) === $fnNoExt) {
                $p = $this->safePath($record['image']);
                if ($p) return $p;
            }
        }
        throw new \RuntimeException('模板不存在或已移除，请重新选择');
    }

    public function addCustom(array $record): void
    {
        if (empty($record['id']) || !$this->safePath($record['image'] ?? '') || empty($record['sha256'])) {
            throw new \RuntimeException('模板记录无效');
        }
        $this->withCustomLock(function () use ($record): void {
            $rows = $this->readCustom();
            foreach ($rows as $existing) {
                if (($existing['id'] ?? '') === $record['id'] || ($existing['sha256'] ?? '') === $record['sha256']) {
                    throw new \RuntimeException('该模板已上传，请直接选择已有模板');
                }
            }
            array_unshift($rows, $record);
            $this->writeCustom($rows);
        });
    }

    public function deleteCustom(string $id): void
    {
        $this->withCustomLock(function () use ($id): void {
            $rows = $this->readCustom();
            $remaining = []; $removed = [];
            foreach ($rows as $row) {
                if (($row['id'] ?? '') === $id) $removed[] = $row;
                else $remaining[] = $row;
            }
            if (!$removed) return;
            // Publish the index first: a failed write leaves old files intact.
            $this->writeCustom($remaining);
            $referenced = [];
            foreach ($remaining as $row) {
                $referenced[] = $this->safePath($row['image'] ?? '');
                $referenced[] = $this->safePath($row['thumb'] ?? '');
            }
            $customBase = realpath($this->root . '/resources/img/templates_ai/custom');
            foreach ($removed as $row) foreach (array_unique([$row['image'] ?? '', $row['thumb'] ?? '']) as $relative) {
                $path = $this->safePath($relative);
                if ($path && $customBase && str_starts_with($path, $customBase . DIRECTORY_SEPARATOR) && !in_array($path, $referenced, true)) {
                    if (!unlink($path)) error_log('Unable to remove custom AI template asset');
                }
            }
        });
    }

    private function withCustomLock(callable $operation, bool $exclusive = true): mixed
    {
        $lock = fopen($this->root . '/data/ai_templates_custom.json.lock', 'c');
        if (!$lock) throw new \RuntimeException('无法打开模板索引锁');
        try {
            if (!flock($lock, $exclusive ? LOCK_EX : LOCK_SH)) throw new \RuntimeException('模板目录忙，请稍后重试');
            return $operation();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    private function readCustom(): array
    {
        $file = $this->root . '/data/ai_templates_custom.json';
        if (!is_file($file)) return [];
        $rows = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($rows) || !array_is_list($rows)) throw new \RuntimeException('模板索引格式错误');
        foreach ($rows as $row) if (!is_array($row)) throw new \RuntimeException('模板索引记录错误');
        return $rows;
    }

    private function writeCustom(array $rows): void
    {
        $file = $this->root . '/data/ai_templates_custom.json';
        $bytes = json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $temporary = tempnam(dirname($file), '.ai-catalog-');
        if ($temporary === false) throw new \RuntimeException('无法创建模板索引临时文件');
        try {
            if (file_put_contents($temporary, $bytes) !== strlen($bytes)) throw new \RuntimeException('模板索引写入不完整');
            if (is_file($file)) chmod($temporary, fileperms($file) & 0777);
            if (!rename($temporary, $file)) throw new \RuntimeException('模板索引发布失败');
        } finally {
            if (is_file($temporary)) unlink($temporary);
        }
    }

    private function safePath(string $relative): ?string
    {
        if (!preg_match('#^resources/img/templates_ai/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp)$#D', $relative)) return null;
        $path = realpath($this->root . '/' . $relative);
        $base = realpath($this->root . '/resources/img/templates_ai');
        return $path && $base && is_file($path) && str_starts_with($path, $base . DIRECTORY_SEPARATOR) ? $path : null;
    }
}
