<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Autenticación
 *
 * Inicio y cierre de sesión con token Bearer.
 */
class AuthController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    /**
     * Iniciar sesión
     *
     * Devuelve un token Bearer (válido 8 horas) y los datos del usuario con su rol.
     *
     * @unauthenticated
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $datos = $request->validated();

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso.',
            'data' => $this->authService->login($datos['correo'], $datos['password']),
        ]);
    }

    /**
     * Usuario autenticado
     *
     * Devuelve los datos del usuario dueño del token.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Usuario autenticado.',
            'data' => $this->authService->datosPublicos($request->user()),
        ]);
    }

    /**
     * Cerrar sesión
     *
     * Revoca el token actual.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->attributes->get('token_acceso'));

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.',
            'data' => null,
        ]);
    }
}
