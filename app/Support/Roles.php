<?php

namespace App\Support;

/**
 * Nombres de los roles del sistema. Deben coincidir EXACTAMENTE con la
 * columna `roles.nombre` (ver DatabaseSeeder).
 */
final class Roles
{
    public const ADMIN       = 'Administrador';
    public const VENDEDOR    = 'Vendedor';
    public const CONFIRMADOR = 'Confirmador';
    public const PRODUCCION  = 'Encargado de Producción';
    public const TAPICERO    = 'Tapicero';

    /**
     * Arma el middleware de rol para las rutas.
     * Roles::middleware(Roles::ADMIN, Roles::VENDEDOR) → 'rol:Administrador,Vendedor'
     */
    public static function middleware(string ...$roles): string
    {
        return 'rol:' . implode(',', $roles);
    }
}
