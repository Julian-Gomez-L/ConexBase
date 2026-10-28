<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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

            $administradorUsuarioId = DB::table('usuarios')->insertGetId([
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

            $vendedorUsuarioId = DB::table('usuarios')->insertGetId([
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

            $produccionUsuarioId = DB::table('usuarios')->insertGetId([
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

            $tapiceroUsuarioId = DB::table('usuarios')->insertGetId([
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


            /*
            |--------------------------------------------------------------------------
            | CLIENTES
            |--------------------------------------------------------------------------
            */

            $cliente1Id = DB::table('clientes')->insertGetId([
                'documento' => '1010101010',
                'nombre' => 'Pedro Ramirez',
                'telefono' => '3001234567',
                'correo' => 'pedro@gmail.com',
                'direccion' => 'Calle 10 # 20-30',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $cliente2Id = DB::table('clientes')->insertGetId([
                'documento' => '2020202020',
                'nombre' => 'Laura Torres',
                'telefono' => '3019876543',
                'correo' => 'laura@gmail.com',
                'direccion' => 'Carrera 15 # 40-20',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $cliente3Id = DB::table('clientes')->insertGetId([
                'documento' => '3030303030',
                'nombre' => 'Maria Hernandez',
                'telefono' => '3105556677',
                'correo' => 'maria@gmail.com',
                'direccion' => 'Calle 80 # 12-15',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            /*
            |--------------------------------------------------------------------------
            | CATEGORIAS
            |--------------------------------------------------------------------------
            */

            $salaCategoriaId = DB::table('categorias')->insertGetId([
                'nombre' => 'Sala',
                'descripcion' => 'Muebles destinados para salas y espacios de descanso',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sillasCategoriaId = DB::table('categorias')->insertGetId([
                'nombre' => 'Sillas',
                'descripcion' => 'Sillas para diferentes espacios del hogar',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $mesasCategoriaId = DB::table('categorias')->insertGetId([
                'nombre' => 'Mesas',
                'descripcion' => 'Mesas para comedor y otros espacios',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            /*
            |--------------------------------------------------------------------------
            | PRODUCTOS
            |--------------------------------------------------------------------------
            */

            $sofaId = DB::table('productos')->insertGetId([
                'nombre' => 'Sofa 3 puestos',
                'descripcion' => 'Sofa de tres puestos tapizado',
                'precio' => 1500000,
                'categoria_id' => $salaCategoriaId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sillaId = DB::table('productos')->insertGetId([
                'nombre' => 'Silla comedor',
                'descripcion' => 'Silla para comedor tapizada',
                'precio' => 250000,
                'categoria_id' => $sillasCategoriaId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $mesaId = DB::table('productos')->insertGetId([
                'nombre' => 'Mesa comedor',
                'descripcion' => 'Mesa de comedor para seis personas',
                'precio' => 800000,
                'categoria_id' => $mesasCategoriaId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sofaDosPuestosId = DB::table('productos')->insertGetId([
                'nombre' => 'Sofa 2 puestos',
                'descripcion' => 'Sofa compacto de dos puestos',
                'precio' => 1100000,
                'categoria_id' => $salaCategoriaId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sillaOficinaId = DB::table('productos')->insertGetId([
                'nombre' => 'Silla de oficina',
                'descripcion' => 'Silla de oficina tapizada',
                'precio' => 450000,
                'categoria_id' => $sillasCategoriaId,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            /*
            |--------------------------------------------------------------------------
            | PEDIDOS
            |--------------------------------------------------------------------------
            */

            $pedido1Id = DB::table('pedidos')->insertGetId([
                'cliente_id' => $cliente1Id,
                'usuario_id' => $vendedorUsuarioId,
                'estado' => 'Pendiente',
                'total' => 2000000,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $pedido2Id = DB::table('pedidos')->insertGetId([
                'cliente_id' => $cliente2Id,
                'usuario_id' => $vendedorUsuarioId,
                'estado' => 'En producción',
                'total' => 1300000,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $pedido3Id = DB::table('pedidos')->insertGetId([
                'cliente_id' => $cliente3Id,
                'usuario_id' => $vendedorUsuarioId,
                'estado' => 'Entregado',
                'total' => 1250000,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            /*
            |--------------------------------------------------------------------------
            | DETALLE PEDIDOS
            |--------------------------------------------------------------------------
            */

            // Pedido 1:
            // 1 Sofa = 1.500.000
            // 2 Sillas = 500.000
            // Total = 2.000.000

            DB::table('detalle_pedidos')->insert([
                [
                    'pedido_id' => $pedido1Id,
                    'producto_id' => $sofaId,
                    'cantidad' => 1,
                    'precio_unitario' => 1500000,
                    'subtotal' => 1500000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido1Id,
                    'producto_id' => $sillaId,
                    'cantidad' => 2,
                    'precio_unitario' => 250000,
                    'subtotal' => 500000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // Pedido 2:
            // 2 Sillas = 500.000
            // 1 Mesa = 800.000
            // Total = 1.300.000

            DB::table('detalle_pedidos')->insert([
                [
                    'pedido_id' => $pedido2Id,
                    'producto_id' => $sillaId,
                    'cantidad' => 2,
                    'precio_unitario' => 250000,
                    'subtotal' => 500000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido2Id,
                    'producto_id' => $mesaId,
                    'cantidad' => 1,
                    'precio_unitario' => 800000,
                    'subtotal' => 800000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // Pedido 3:
            // 1 Sofa 2 puestos = 1.100.000
            // 1 Silla oficina = 450.000
            // Para dejar un ejemplo de pedido con otro valor,
            // utilizamos solo el sofa de 2 puestos + 1 silla.
            // Total real = 1.550.000

            DB::table('detalle_pedidos')->insert([
                [
                    'pedido_id' => $pedido3Id,
                    'producto_id' => $sofaDosPuestosId,
                    'cantidad' => 1,
                    'precio_unitario' => 1100000,
                    'subtotal' => 1100000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido3Id,
                    'producto_id' => $sillaOficinaId,
                    'cantidad' => 1,
                    'precio_unitario' => 450000,
                    'subtotal' => 450000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);


            /*
            |--------------------------------------------------------------------------
            | PAGOS
            |--------------------------------------------------------------------------
            */

            DB::table('pagos')->insert([
                [
                    'pedido_id' => $pedido1Id,
                    'usuario_id' => $vendedorUsuarioId,
                    'monto' => 2000000,
                    'metodo' => 'Transferencia',
                    'fecha_pago' => '2026-09-01',
                    'comprobante' => 'COMP-0001',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido2Id,
                    'usuario_id' => $vendedorUsuarioId,
                    'monto' => 650000,
                    'metodo' => 'Efectivo',
                    'fecha_pago' => '2026-09-02',
                    'comprobante' => 'COMP-0002',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido3Id,
                    'usuario_id' => $vendedorUsuarioId,
                    'monto' => 1550000,
                    'metodo' => 'Transferencia',
                    'fecha_pago' => '2026-09-03',
                    'comprobante' => 'COMP-0003',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);


            /*
            |--------------------------------------------------------------------------
            | PRODUCCIONES
            |--------------------------------------------------------------------------
            */

            $produccion1Id = DB::table('producciones')->insertGetId([
                'pedido_id' => $pedido1Id,
                'producto_id' => $sofaId,
                'usuario_id' => $produccionUsuarioId,
                'fecha_inicio' => '2026-09-02',
                'fecha_fin' => null,
                'estado' => 'En proceso',
                'observaciones' => 'Fabricacion del sofa de tres puestos',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $produccion2Id = DB::table('producciones')->insertGetId([
                'pedido_id' => $pedido2Id,
                'producto_id' => $mesaId,
                'usuario_id' => $produccionUsuarioId,
                'fecha_inicio' => '2026-09-03',
                'fecha_fin' => null,
                'estado' => 'Pendiente',
                'observaciones' => 'Produccion de mesa de comedor',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $produccion3Id = DB::table('producciones')->insertGetId([
                'pedido_id' => $pedido3Id,
                'producto_id' => $sofaDosPuestosId,
                'usuario_id' => $produccionUsuarioId,
                'fecha_inicio' => '2026-08-25',
                'fecha_fin' => '2026-08-30',
                'estado' => 'Finalizada',
                'observaciones' => 'Trabajo terminado correctamente',
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            /*
            |--------------------------------------------------------------------------
            | TRABAJOS TAPICEROS
            |--------------------------------------------------------------------------
            */

            DB::table('trabajos_tapiceros')->insert([
                [
                    'produccion_id' => $produccion1Id,
                    'usuario_id' => $tapiceroUsuarioId,
                    'descripcion' => 'Tapizado del sofa de tres puestos',
                    'fecha_inicio' => '2026-09-03',
                    'fecha_fin' => null,
                    'estado' => 'En proceso',
                    'observaciones' => 'Utilizar tela color gris',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'produccion_id' => $produccion2Id,
                    'usuario_id' => $tapiceroUsuarioId,
                    'descripcion' => 'Tapizado de sillas para comedor',
                    'fecha_inicio' => '2026-09-04',
                    'fecha_fin' => null,
                    'estado' => 'Pendiente',
                    'observaciones' => 'Pendiente recibir material',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'produccion_id' => $produccion3Id,
                    'usuario_id' => $tapiceroUsuarioId,
                    'descripcion' => 'Tapizado final del sofa de dos puestos',
                    'fecha_inicio' => '2026-08-26',
                    'fecha_fin' => '2026-08-29',
                    'estado' => 'Finalizado',
                    'observaciones' => 'Trabajo terminado',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);


            /*
            |--------------------------------------------------------------------------
            | HISTORIAL PEDIDOS
            |--------------------------------------------------------------------------
            */

            DB::table('historial_pedidos')->insert([
                [
                    'pedido_id' => $pedido1Id,
                    'usuario_id' => $vendedorUsuarioId,
                    'cliente_id' => $cliente1Id,
                    'estado_anterior' => null,
                    'estado_nuevo' => 'Pendiente',
                    'observacion' => 'Pedido creado',
                    'fecha' => '2026-09-01 09:00:00',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido2Id,
                    'usuario_id' => $vendedorUsuarioId,
                    'cliente_id' => $cliente2Id,
                    'estado_anterior' => null,
                    'estado_nuevo' => 'Pendiente',
                    'observacion' => 'Pedido creado',
                    'fecha' => '2026-09-02 10:00:00',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido2Id,
                    'usuario_id' => $produccionUsuarioId,
                    'cliente_id' => $cliente2Id,
                    'estado_anterior' => 'Pendiente',
                    'estado_nuevo' => 'En producción',
                    'observacion' => 'Pedido enviado a producción',
                    'fecha' => '2026-09-03 08:00:00',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido3Id,
                    'usuario_id' => $vendedorUsuarioId,
                    'cliente_id' => $cliente3Id,
                    'estado_anterior' => null,
                    'estado_nuevo' => 'En producción',
                    'observacion' => 'Pedido creado y enviado a producción',
                    'fecha' => '2026-08-25 09:00:00',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'pedido_id' => $pedido3Id,
                    'usuario_id' => $administradorUsuarioId,
                    'cliente_id' => $cliente3Id,
                    'estado_anterior' => 'En producción',
                    'estado_nuevo' => 'Entregado',
                    'observacion' => 'Pedido entregado al cliente',
                    'fecha' => '2026-08-30 16:00:00',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        });
    }
}