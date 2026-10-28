<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiAuthException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe una ruta a ciertos roles. Uso: ->middleware('rol:Administrador,Vendedor')
 * Debe ir DESPUÉS de `auth.token`.
 */
class RequiereRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $rol = $request->user()?->rol?->nombre;

        if (!$rol || !in_array($rol, $roles, true)) {
            throw ApiAuthException::accesoDenegado();
        }

        return $next($request);
    }
}
