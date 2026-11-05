<?php

namespace App\Support;

/**
 * Nombres de los roles del sistema. Deben coincidir EXACTAMENTE con la
 * columna `roles.nombre` (ver DatabaseSeeder y la migración 15).
 */
final class Roles
{
    /** Hace todo lo del Administrador y, además, es el único que modifica
     *  usuarios y roles y maneja el código de recuperación (ADR-0008). */
    public const SUPERADMIN  = 'Super Administrador';
    public const ADMIN       = 'Administrador';
    public const VENDEDOR    = 'Vendedor';
    public const CONFIRMADOR = 'Confirmador';
    public const PRODUCCION  = 'Encargado de Producción';
    public const TAPICERO    = 'Tapicero';

    public const DESCRIPCION_SUPERADMIN = 'Todo lo del Administrador; además gestiona usuarios, roles y el código de recuperación';

    /**
     * Arma el middleware de rol para las rutas.
     * Roles::middleware(Roles::ADMIN, Roles::VENDEDOR) → 'rol:Super Administrador,Administrador,Vendedor'
     *
     * El Super Administrador HEREDA todo lo del Administrador: si la lista
     * incluye ADMIN, se agrega SUPERADMIN automáticamente. Así no hay que
     * repetirlo en cada grupo de rutas.
     */
    public static function middleware(string ...$roles): string
    {
        if (in_array(self::ADMIN, $roles, true) && !in_array(self::SUPERADMIN, $roles, true)) {
            array_unshift($roles, self::SUPERADMIN);
        }

        return 'rol:' . implode(',', $roles);
    }
}
