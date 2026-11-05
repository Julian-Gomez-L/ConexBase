<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Solo roles y usuarios (sin clientes, productos ni pedidos) para hacer pruebas con datos reales.
        // Idempotente: si ya hay datos no se vuelve a sembrar (el arranque con Docker lo ejecuta siempre).
        if (DB::table('roles')->exists()) {
            $this->command?->info('Los datos de prueba ya existen; no se vuelven a insertar.');
            return;
        }

        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | ROLES
            |--------------------------------------------------------------------------
            */

            $administradorId = DB::table('roles')->insertGetId([
                'nombre' => 'Administrador',
                'descripcion' => 'Usuario con acceso completo al sistema',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $vendedorId = DB::table('roles')->insertGetId([
                'nombre' => 'Vendedor',
                'descripcion' => 'Usuario encargado de realizar ventas y pedidos',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $produccionId = DB::table('roles')->insertGetId([
                'nombre' => 'Encargado de Producción',
                'descripcion' => 'Usuario encargado de gestionar la producción',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $tapiceroId = DB::table('roles')->insertGetId([
                'nombre' => 'Tapicero',
                'descripcion' => 'Usuario encargado de realizar trabajos de tapicería',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $confirmadorId = DB::table('roles')->insertGetId([
                'nombre' => 'Confirmador',
                'descripcion' => 'Usuario encargado de revisar y confirmar los pedidos',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            /*
            |--------------------------------------------------------------------------
            | USUARIOS
            |--------------------------------------------------------------------------
            */

            DB::table('usuarios')->insert([
                'documento' => '1001001001',
                'nombre' => 'Carlos',
                'apellido' => 'Rodriguez',
                'correo' => 'admin@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $administradorId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('usuarios')->insert([
                'documento' => '1001001002',
                'nombre' => 'Juan',
                'apellido' => 'Perez',
                'correo' => 'vendedor@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $vendedorId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('usuarios')->insert([
                'documento' => '1001001003',
                'nombre' => 'Andres',
                'apellido' => 'Gomez',
                'correo' => 'produccion@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $produccionId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('usuarios')->insert([
                'documento' => '1001001004',
                'nombre' => 'Miguel',
                'apellido' => 'Martinez',
                'correo' => 'tapicero@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $tapiceroId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('usuarios')->insert([
                'documento' => '1001001005',
                'nombre' => 'Sofia',
                'apellido' => 'Castro',
                'correo' => 'confirmador@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $confirmadorId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Segundo asesor: permite comprobar que "Mis Pedidos" muestra solo los propios.
            DB::table('usuarios')->insert([
                'documento' => '1001001006',
                'nombre' => 'Valentina',
                'apellido' => 'Suarez',
                'correo' => 'vendedor2@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $vendedorId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }
}