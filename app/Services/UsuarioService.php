<?php

namespace App\Services;

use App\Interfaces\UsuarioInterface;
use App\Support\Roles;
use Illuminate\Validation\ValidationException;

class UsuarioService extends BaseService
{
    public function __construct(private UsuarioInterface $usuarios)
    {
        parent::__construct($usuarios);
    }

    protected function codigo(): string
    {
        return 'USUARIO';
    }

    protected function sustantivo(): string
    {
        return 'usuario';
    }

    public function update(array $data, $id)
    {
        // Si no se envía una contraseña nueva, se conserva la actual
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $this->protegerUltimoSuperAdministrador($this->validarId($id), $data);

        return parent::update($data, $id);
    }

    public function destroy($id)
    {
        $this->protegerUltimoSuperAdministrador($this->validarId($id), ['estado' => false]);

        return parent::destroy($id);
    }

    /**
     * Impide dejar el sistema sin Super Administrador: no se puede desactivar,
     * eliminar ni cambiarle el rol al último que queda activo (ADR-0008).
     */
    private function protegerUltimoSuperAdministrador(int $id, array $cambios): void
    {
        $usuario = $this->usuarios->getById($id);

        if (!$usuario || !$usuario->estado || $usuario->rol?->nombre !== Roles::SUPERADMIN) {
            return;
        }

        $quedaInactivo = array_key_exists('estado', $cambios) && !$cambios['estado'];
        $cambiaDeRol = array_key_exists('rol_id', $cambios) && (int) $cambios['rol_id'] !== (int) $usuario->rol_id;

        if (($quedaInactivo || $cambiaDeRol) && $this->usuarios->contarSuperAdministradoresActivos() <= 1) {
            throw ValidationException::withMessages([
                'rol_id' => 'Es el único Super Administrador activo: asigna primero el rol a otra persona.',
            ]);
        }
    }
}
