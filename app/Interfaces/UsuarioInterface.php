<?php

namespace App\Interfaces;

use App\Models\Usuario;

interface UsuarioInterface extends BaseInterface
{
    /** Busca un usuario activo (no borrado) por correo, con su rol cargado. */
    public function buscarPorCorreo(string $correo): ?Usuario;

    /** true si existe al menos un usuario activo con el rol Administrador. */
    public function hayAdministradorActivo(): bool;

    /** Busca por correo incluyendo los usuarios eliminados (borrado lógico). */
    public function buscarPorCorreoConEliminados(string $correo): ?Usuario;

    /** true si algún usuario (incluso eliminado) tiene ese documento. */
    public function existeDocumento(string $documento): bool;

    /** Restaura y activa al usuario con el rol dado y una contraseña nueva. */
    public function activarComoAdministrador(Usuario $usuario, int $rolId, string $password): Usuario;
}
