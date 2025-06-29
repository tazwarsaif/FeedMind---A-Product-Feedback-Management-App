<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => [],  // <-- Token-based API only (disable session cookies)

    'guard' => ['web'], // Default is fine unless you're using custom guards

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
