<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';
use Photobooth\Service\WorkshopService;

function verify(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
$directory = sys_get_temp_dir() . '/photobooth-workshop-test-' . bin2hex(random_bytes(6));
mkdir($directory);
$colors = [[220,40,40],[40,190,40],[40,40,220],[220,180,40],[180,40,200],[30,190,190]];
$files = [];
try {
    foreach ($colors as $index => $color) {
        // Landscape source and a narrow center marker verify center cropping without stretching.
        $source = imagecreatetruecolor(900, 600);
        imagefill($source, 0, 0, imagecolorallocate($source, ...$color));
        imagefilledrectangle($source, 440, 290, 460, 310, imagecolorallocate($source, 255, 255, 255));
        $files[] = $directory . '/' . $index . '.png';
        imagepng($source, $files[$index]);
        imagedestroy($source);
    }
    foreach (WorkshopService::catalog()['layouts'] as $layout) {
        $layout = WorkshopService::layout($layout['id']);
        $output = $directory . '/' . $layout['id'] . '.jpg';
        (new WorkshopService())->compose($layout['id'], array_slice($files, 0, count($layout['cells'])), $output);
        $image = imagecreatefromjpeg($output);
        verify(imagesx($image) === $layout['width'] && imagesy($image) === $layout['height'], 'Output must use template dimensions');
        verify(imageresolution($image) === [300, 300], 'Output must carry 300 DPI metadata');
        foreach ($layout['cells'] as $index => [$x,$y,$w,$h]) {
            verify($x >= 0 && $y >= 0 && $x+$w <= $layout['width'] && $y+$h <= $layout['height'], 'Cell outside photo');
            $pixel = imagecolorat($image, $x + (int)($w * .25), $y + (int)($h * .25));
            foreach ([($pixel >> 16) & 255, ($pixel >> 8) & 255, $pixel & 255] as $channel => $value) {
                verify(abs($value - $colors[$index][$channel]) < 8, 'Photo order/crop mismatch: ' . $layout['id']);
            }
            $middle = imagecolorat($image, $x+(int)($w/2), $y+(int)($h/2));
            verify(($middle & 255) > 235 && (($middle >> 16) & 255) > 235, 'Center marker must remain centered');
            foreach (array_slice($layout['cells'], $index + 1) as [$ox,$oy,$ow,$oh]) {
                verify($x+$w <= $ox || $ox+$ow <= $x || $y+$h <= $oy || $oy+$oh <= $y, 'Overlapping photo cells');
            }
        }
        if ($layout['id'] === 'hainan_daily') {
            verify([$layout['width'], $layout['height']] === [3600, 5143], 'Newspaper must retain original aspect ratio');
            $frame = imagecreatefrompng(__DIR__ . '/../' . $layout['background']);
            $totalDifference = $samples = 0;
            for ($py = 0; $py < $layout['height']; $py += 17) {
                for ($px = 0; $px < $layout['width']; $px += 17) {
                    foreach ($layout['cells'] as [$x,$y,$w,$h]) {
                        if ($px >= $x-4 && $px < $x+$w+4 && $py >= $y-4 && $py < $y+$h+4) continue 2;
                    }
                    $actual = imagecolorat($image, $px, $py);
                    $expected = imagecolorat($frame, $px, $py);
                    foreach ([0,8,16] as $shift) {
                        $totalDifference += abs((($actual >> $shift)&255) - (($expected >> $shift)&255));
                        $samples++;
                    }
                }
            }
            verify($totalDifference / $samples < 2, 'Newspaper artwork and body must survive composition (allowing JPEG compression)');
            imagedestroy($frame);
        }
        imagedestroy($image);
        echo 'PASS ' . $layout['id'] . ': ordered photos, center crop, ' . $layout['width'] . 'x' . $layout['height'] . ', 300 DPI' . PHP_EOL;
    }
    foreach ([['missing', $files], ['grid4', array_slice($files, 0, 3)]] as [$layout, $sources]) {
        $rejected = false;
        try { (new WorkshopService())->compose($layout, $sources, $directory . '/invalid.jpg'); }
        catch (InvalidArgumentException) { $rejected = true; }
        verify($rejected, 'Invalid layouts/counts must be rejected');
    }
    echo 'PASS invalid layout and incomplete capture rejection' . PHP_EOL;
} finally {
    foreach (glob($directory . '/*') as $file) unlink($file);
    rmdir($directory);
}
