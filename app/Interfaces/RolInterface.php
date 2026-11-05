<?php

namespace App\Interfaces;

use App\Models\Rol;

interface RolInterface extends BaseInterface
{
    /**
     * Devuelve el rol Super Administrador listo para usar: lo crea si no existe
     * y lo restaura y activa si fue eliminado o desactivado.
     */
    public function asegurarSuperAdministrador(): Rol;
}
