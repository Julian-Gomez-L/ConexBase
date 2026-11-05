<?php

namespace App\Repositories;

use App\Interfaces\RolInterface;
use App\Models\Rol;
use App\Support\Roles;

class RolRepository extends BaseRepository implements RolInterface
{
    public function __construct(Rol $RolModel)
    {
        parent::__construct($RolModel);
    }

    public function asegurarSuperAdministrador(): Rol
    {
        $rol = $this->model->withTrashed()->firstOrCreate(
            ['nombre' => Roles::SUPERADMIN],
            ['descripcion' => Roles::DESCRIPCION_SUPERADMIN, 'estado' => true]
        );

        if ($rol->trashed()) {
            $rol->restore();
        }
        if (!$rol->estado) {
            $rol->update(['estado' => true]);
        }

        return $rol;
    }

}