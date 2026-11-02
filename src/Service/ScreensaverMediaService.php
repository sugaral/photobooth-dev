<?php

namespace Photobooth\Service;

use Photobooth\Utility\PathUtility;

/** Curated screensaver media only; never reads the guest gallery. */
final class ScreensaverMediaService
{
    public static function images(): array
    {
        $directory = realpath(PathUtility::getAbsolutePath('private/screensavers'));
        if ($directory === false) {
            return [];
        }
        $images = [];
        foreach (new \DirectoryIterator($directory) as $file) {
            if (!$file->isFile() || $file->isLink() || str_starts_with($file->getFilename(), '.')) {
                continue;
            }
            if (!in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
                continue;
            }
            $size = @getimagesize($file->getPathname());
            if (!$size || !in_array($size['mime'], ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
                continue;
            }
            $images[] = [
                'name' => $file->getFilename(),
                'url' => PathUtility::getPublicPath('private/screensavers/') . rawurlencode($file->getFilename()) . '?v=' . $file->getMTime(),
                'width' => $size[0],
                'height' => $size[1],
            ];
        }
        usort($images, static fn (array $a, array $b): int => strnatcasecmp($a['name'], $b['name']) ?: strcmp($a['name'], $b['name']));
        return $images;
    }
}
