<?php

namespace App\Services;

use App\Interfaces\RolInterface;
use App\Support\Roles;
use Illuminate\Validation\ValidationException;

class RolService extends BaseService
{
    public function __construct(RolInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'ROL';
    }

    protected function sustantivo(): string
    {
        return 'rol';
    }

    public function update(array $data, $id)
    {
        $rol = $this->repository->getById($this->validarId($id));

        if ($rol?->nombre === Roles::SUPERADMIN) {
            $renombra = array_key_exists('nombre', $data) && $data['nombre'] !== Roles::SUPERADMIN;
            $desactiva = array_key_exists('estado', $data) && !$data['estado'];
            if ($renombra || $desactiva) {
                $this->rolProtegido();
            }
        }

        return parent::update($data, $id);
    }

    public function destroy($id)
    {
        $rol = $this->repository->getById($this->validarId($id));
        if ($rol?->nombre === Roles::SUPERADMIN) {
            $this->rolProtegido();
        }

        return parent::destroy($id);
    }

    /** El rol Super Administrador no se renombra, desactiva ni elimina (ADR-0008). */
    private function rolProtegido(): never
    {
        throw ValidationException::withMessages([
            'nombre' => 'El rol Super Administrador no se puede renombrar, desactivar ni eliminar.',
        ]);
    }
}
