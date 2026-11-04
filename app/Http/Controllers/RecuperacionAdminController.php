<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RecuperarAdminRequest;
use App\Services\RecuperacionAdminService;
use Illuminate\Http\Request;

/**
 * @group Recuperación de administrador
 *
 * Código de emergencia para volver a tener un Administrador cuando no queda
 * ninguno activo, sin depender de un desarrollador.
 */
class RecuperacionAdminController extends Controller
{
    public function __construct(private RecuperacionAdminService $recuperacionService)
    {
    }

    /**
     * Estado del código
     *
     * Dice si hay un código de recuperación guardado, cuándo y quién lo generó.
     * Nunca devuelve el código.
     */
    public function estado()
    {
        return $this->ok($this->recuperacionService->estado(), 'Estado del código de recuperación.');
    }

    /**
     * Generar código
     *
     * Crea un código nuevo y reemplaza el anterior. Es la única vez que se muestra:
     * hay que imprimirlo o guardarlo en un lugar seguro.
     */
    public function generar(Request $request)
    {
        return $this->creado(
            $this->recuperacionService->generar($request->user()),
            'Código de recuperación generado. Guárdalo en un lugar seguro: no se volverá a mostrar.'
        );
    }

    /**
     * Recuperar acceso de administrador
     *
     * Solo funciona si no hay ningún administrador activo. Crea un Administrador
     * (o reactiva al usuario de ese correo) y el código queda usado.
     *
     * @unauthenticated
     */
    public function recuperar(RecuperarAdminRequest $request)
    {
        $usuario = $this->recuperacionService->recuperar(
            $request->validated(),
            $request->ip(),
            $request->userAgent()
        );

        return $this->creado(
            ['correo' => $usuario->correo],
            'Listo. Ya puedes iniciar sesión como Administrador. Genera un código de recuperación nuevo.'
        );
    }
}
