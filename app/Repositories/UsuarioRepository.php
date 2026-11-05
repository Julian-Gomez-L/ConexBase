<?php

namespace App\Repositories;

use App\Interfaces\UsuarioInterface;
use App\Models\Usuario;
use App\Support\Roles;

class UsuarioRepository extends BaseRepository implements UsuarioInterface
{
    public function __construct(Usuario $usuarioModel)
    {
        parent::__construct($usuarioModel);
    }

    public function buscarPorCorreo(string $correo): ?Usuario
    {
        return $this->model
            ->with('rol')
            ->where('correo', $correo)
            ->first();
    }

    public function haySuperAdministradorActivo(): bool
    {
        return $this->contarSuperAdministradoresActivos() > 0;
    }

    public function contarSuperAdministradoresActivos(): int
    {
        return $this->model
            ->where('estado', true)
            ->whereHas('rol', fn ($q) => $q->where('nombre', Roles::SUPERADMIN)->where('estado', true))
            ->count();
    }

    public function buscarPorCorreoConEliminados(string $correo): ?Usuario
    {
        return $this->model->withTrashed()->where('correo', $correo)->first();
    }

    public function existeDocumento(string $documento): bool
    {
        return $this->model->withTrashed()->where('documento', $documento)->exists();
    }

    public function activarConRol(Usuario $usuario, int $rolId, string $password): Usuario
    {
        if ($usuario->trashed()) {
            $usuario->restore();
        }

        $usuario->update(['rol_id' => $rolId, 'estado' => true, 'password' => $password]);

        return $usuario->fresh();
    }
}
