<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiAuthException;
use App\Interfaces\TokenAccesoInterface;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exige `Authorization: Bearer <token>` válido y vigente.
 * Deja disponible el usuario con `$request->user()` y el token en `$request->attributes`.
 */
class AutenticarConToken
{
    public function __construct(private TokenAccesoInterface $tokens)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $tokenPlano = $request->bearerToken();

        if (!$tokenPlano) {
            throw ApiAuthException::noAutenticado();
        }

        $token = $this->tokens->buscarVigente(hash('sha256', $tokenPlano));
        $usuario = $token?->usuario;

        if (!$token || !$usuario || !$usuario->estado) {
            throw ApiAuthException::noAutenticado();
        }

        $this->tokens->marcarUso($token);

        $request->setUserResolver(fn () => $usuario);
        $request->attributes->set('token_acceso', $token);

        return $next($request);
    }
}
