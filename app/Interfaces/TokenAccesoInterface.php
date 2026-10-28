<?php

namespace App\Interfaces;

use App\Models\TokenAcceso;

interface TokenAccesoInterface
{
    public function crear(array $datos): TokenAcceso;

    /** Busca por el hash sha256 del token, solo si no ha expirado. Incluye usuario y rol. */
    public function buscarVigente(string $hash): ?TokenAcceso;

    public function marcarUso(TokenAcceso $token): void;

    public function revocar(TokenAcceso $token): void;

    /** Borra los tokens vencidos de un usuario (limpieza al iniciar sesión). */
    public function eliminarExpirados(int $usuarioId): void;
}
