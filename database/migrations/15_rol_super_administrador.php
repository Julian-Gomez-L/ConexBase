<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Crea el rol "Super Administrador" en las bases de datos que ya existen
 * (en una base nueva lo crea también el seeder). ADR-0008.
 *
 * No convierte a nadie en Super Administrador: en una base existente se asigna
 * con el código de recuperación (si no hay ninguno activo, crea uno) o con
 * `php artisan migrate:fresh --seed` en desarrollo.
 */
return new class extends Migration
{
    private const NOMBRE = 'Super Administrador';

    public function up(): void
    {
        if (DB::table('roles')->where('nombre', self::NOMBRE)->exists()) {
            return;
        }

        DB::table('roles')->insert([
            'nombre' => self::NOMBRE,
            'descripcion' => 'Todo lo del Administrador; además gestiona usuarios, roles y el código de recuperación',
            'estado' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        $rol = DB::table('roles')->where('nombre', self::NOMBRE)->first();

        // Solo se quita si nadie lo tiene asignado
        if ($rol && !DB::table('usuarios')->where('rol_id', $rol->id)->exists()) {
            DB::table('roles')->where('id', $rol->id)->delete();
        }
    }
};
