<?php

use App\Exceptions\ApiAuthException;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;
use App\Http\Middleware\AutenticarConToken;
use App\Http\Middleware\RequiereRol;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.token' => AutenticarConToken::class,
            'rol' => RequiereRol::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->render(function (ResourceNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'error' => $exception->errorCode,
                'status' => 404
            ], 404);
        });

        $exceptions->render(function (InvalidIdException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'error' => $exception->errorCode,
                'status' => 422
            ], 422);
        });

        $exceptions->render(function (ApiAuthException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'error' => $exception->errorCode,
                'status' => $exception->status
            ], $exception->status);
        });

        // Errores de validación (Form Requests): mismo formato que el resto de errores,
        // conservando `message` y `errors` (campo → mensajes) que lee el frontend.
        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'error' => 'VALIDATION_ERROR',
                'status' => 422,
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.',
                'error' => 'TOO_MANY_REQUESTS',
                'status' => 429
            ], 429, $exception->getHeaders());
        });

    })->create();