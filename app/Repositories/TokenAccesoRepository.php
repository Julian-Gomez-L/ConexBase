<?php

namespace App\Repositories;

use App\Interfaces\TokenAccesoInterface;
use App\Models\TokenAcceso;

class TokenAccesoRepository implements TokenAccesoInterface
{
    public function __construct(private TokenAcceso $model)
    {
    }

    public function crear(array $datos): TokenAcceso
    {
        return $this->model->create($datos);
    }

    public function buscarVigente(string $hash): ?TokenAcceso
    {
        return $this->model
            ->with('usuario.rol')
            ->where('token', $hash)
            ->where('expira_en', '>', now())
            ->first();
    }

    public function marcarUso(TokenAcceso $token): void
    {
        $token->forceFill(['ultimo_uso_en' => now()])->save();
    }

    public function revocar(TokenAcceso $token): void
    {
        $token->delete();
    }

    public function eliminarExpirados(int $usuarioId): void
    {
        $this->model
            ->where('usuario_id', $usuarioId)
            ->where('expira_en', '<=', now())
            ->delete();
    }
}
