<?php

// Private runtime and source paths must not be served by the development server.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (preg_match('~(?:^|/)(?:\.[^/]*|bin|config|lib|src|scripts|tools|vendor|models|var)(?:/|$)~i', $path)
    || preg_match('~^/(?:composer\.(?:json|lock)|package(?:-lock)?\.json|.*\.bat)$~i', $path)) {
    http_response_code(404);
    exit;
}

return false;
