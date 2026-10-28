<?php

namespace App\Interfaces;

use App\Models\Usuario;

interface UsuarioInterface extends BaseInterface
{
    /** Busca un usuario activo (no borrado) por correo, con su rol cargado. */
    public function buscarPorCorreo(string $correo): ?Usuario;
}
