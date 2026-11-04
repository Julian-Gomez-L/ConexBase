<?php

namespace App\Http\Controllers;

use App\Services\IntentosLoginService;

/**
 * @group Intentos de inicio de sesión
 *
 * Registro de los inicios de sesión fallidos: quién, cuándo, desde dónde y por qué.
 * Solo para el Administrador.
 */
class IntentoLoginController extends Controller
{
    public function __construct(private IntentosLoginService $intentosLoginService)
    {
    }

    /**
     * Listar intentos fallidos
     *
     * Devuelve los 500 intentos más recientes, del más nuevo al más antiguo.
     */
    public function index()
    {
        return $this->ok($this->intentosLoginService->list(), 'Los intentos de inicio de sesión se listaron correctamente.');
    }
}
