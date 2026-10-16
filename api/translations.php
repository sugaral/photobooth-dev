<?php

require_once __DIR__ . '/../lib/boot.php';

use Photobooth\Service\LanguageService;

$languageService = LanguageService::getInstance();
header('Content-Type: application/json');
echo json_encode($languageService->all());

exit();
