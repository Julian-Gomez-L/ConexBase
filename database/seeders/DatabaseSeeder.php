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
        // Idempotente: si ya hay usuarios no se vuelve a sembrar (el arranque con Docker lo ejecuta siempre).
        // Se revisan los usuarios y no los roles, porque la migración 15 ya crea el rol Super Administrador.
        if (DB::table('usuarios')->exists()) {
            $this->command?->info('Los datos de prueba ya existen; no se vuelven a insertar.');
            return;
        }

        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | ROLES
            |--------------------------------------------------------------------------
            */

            // Lo crea la migración 15; aquí solo se busca (o se crea si no existe).
            $superAdministradorId = DB::table('roles')->where('nombre', 'Super Administrador')->value('id')
                ?? DB::table('roles')->insertGetId([
                    'nombre' => 'Super Administrador',
                    'descripcion' => 'Todo lo del Administrador; además gestiona usuarios, roles y el código de recuperación',
                    'estado' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            $administradorId = DB::table('roles')->insertGetId([
                'nombre' => 'Administrador',
                'descripcion' => 'Gestiona el negocio: catálogo, pedidos y reportes. Ve los usuarios, pero no los modifica',
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
                'documento' => '1001001000',
                'nombre' => 'Diana',
                'apellido' => 'Moreno',
                'correo' => 'superadmin@conexbase.com',
                'password' => Hash::make('123456'),
                'rol_id' => $superAdministradorId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

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