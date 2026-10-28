<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class Controller
{
    /**
     * Respuesta de éxito con el formato único de la API:
     * { "success": true, "message": "...", "data": ... }
     */
    protected function ok(mixed $data, string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /** Igual que ok(), pero con HTTP 201 Created (para store). */
    protected function creado(mixed $data, string $message): JsonResponse
    {
        return $this->ok($data, $message, 201);
    }
}
