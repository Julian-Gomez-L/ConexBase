<?php

/*
| CORS: qué orígenes (páginas web) pueden llamar a la API desde el navegador.
| En desarrollo el frontend usa un proxy, así que normalmente no se necesita,
| pero queda listo por si se llama a http://localhost:8000 directamente.
| Varios orígenes separados por coma en CORS_ALLOWED_ORIGINS.
*/
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:4200,http://127.0.0.1:4200'))
    ))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
