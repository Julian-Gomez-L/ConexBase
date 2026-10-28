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

            $confirmadorUsuarioId = DB::table('usuarios')->insertGetId([
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
            $vendedor2UsuarioId = DB::table('usuarios')->insertGetId([
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

            $cliente4Id = DB::table('clientes')->insertGetId([
                'documento' => '4040404040',
                'nombre' => 'Andres Lopez',
                'telefono' => '3204447788',
                'correo' => 'andres@gmail.com',
                'direccion' => 'Avenida 68 # 25-10',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $cliente5Id = DB::table('clientes')->insertGetId([
                'documento' => '5050505050',
                'nombre' => 'Camila Rojas',
                'telefono' => '3157778899',
                'correo' => 'camila@gmail.com',
                'direccion' => 'Calle 26 # 50-40',
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
            | PEDIDOS, DETALLES, PAGOS E HISTORIAL
            |--------------------------------------------------------------------------
            | Subtotales y total se calculan con el precio de cada producto, para que
            | siempre cuadren. El historial recorre los estados por los que pasó el
            | pedido, con la persona que hizo cada cambio.
            |
            | Un pedido por estado, para que cada rol tenga algo que probar:
            |   1 Pendiente       (Juan)       → lo revisa el Confirmador
            |   2 En producción   (Juan)       → Fabricación y Tapicero trabajando
            |   3 Entregado       (Juan)       → ciclo completo
            |   4 Confirmado      (Valentina)  → listo para que Fabricación lo reciba
            |   5 Cancelado       (Valentina)
            |   6 Rechazado       (Juan)
            |   7 Pendiente       (Valentina)  → segundo pedido para el Confirmador
            */

            $precios = DB::table('productos')->pluck('precio', 'id');

            $crearPedido = function (array $p) use ($precios) {
                $total = 0;
                foreach ($p['items'] as [$productoId, $cantidad]) {
                    $total += $precios[$productoId] * $cantidad;
                }

                $pedidoId = DB::table('pedidos')->insertGetId([
                    'cliente_id' => $p['cliente'],
                    'usuario_id' => $p['asesor'],
                    'estado' => end($p['historial'])[1],
                    'total' => $total,
                    'created_at' => $p['fecha'],
                    'updated_at' => end($p['historial'])[3],
                ]);

                foreach ($p['items'] as [$productoId, $cantidad]) {
                    DB::table('detalle_pedidos')->insert([
                        'pedido_id' => $pedidoId,
                        'producto_id' => $productoId,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precios[$productoId],
                        'subtotal' => $precios[$productoId] * $cantidad,
                        'created_at' => $p['fecha'],
                        'updated_at' => $p['fecha'],
                    ]);
                }

                foreach ($p['pagos'] ?? [] as [$monto, $metodo, $fechaPago, $comprobante]) {
                    DB::table('pagos')->insert([
                        'pedido_id' => $pedidoId,
                        'usuario_id' => $p['asesor'],
                        'monto' => $monto,
                        'metodo' => $metodo,
                        'fecha_pago' => $fechaPago,
                        'comprobante' => $comprobante,
                        'created_at' => $fechaPago,
                        'updated_at' => $fechaPago,
                    ]);
                }

                $anterior = null;
                foreach ($p['historial'] as [$usuarioId, $estado, $observacion, $fecha]) {
                    DB::table('historial_pedidos')->insert([
                        'pedido_id' => $pedidoId,
                        'usuario_id' => $usuarioId,
                        'cliente_id' => $p['cliente'],
                        'estado_anterior' => $anterior,
                        'estado_nuevo' => $estado,
                        'observacion' => $observacion,
                        'fecha' => $fecha,
                        'created_at' => $fecha,
                        'updated_at' => $fecha,
                    ]);
                    $anterior = $estado;
                }

                return $pedidoId;
            };

            // 1 · Pendiente: 1 sofá 3 puestos + 2 sillas comedor = 2.000.000 (abono del 50 %)
            $pedido1Id = $crearPedido([
                'cliente' => $cliente1Id,
                'asesor' => $vendedorUsuarioId,
                'fecha' => '2026-10-20 09:00:00',
                'items' => [[$sofaId, 1], [$sillaId, 2]],
                'pagos' => [[1000000, 'Transferencia', '2026-10-20', 'COMP-0001']],
                'historial' => [
                    [$vendedorUsuarioId, 'Pendiente', 'Pedido creado', '2026-10-20 09:00:00'],
                ],
            ]);

            // 2 · En producción: 2 sillas comedor + 1 mesa comedor = 1.300.000
            $pedido2Id = $crearPedido([
                'cliente' => $cliente2Id,
                'asesor' => $vendedorUsuarioId,
                'fecha' => '2026-10-10 10:00:00',
                'items' => [[$sillaId, 2], [$mesaId, 1]],
                'pagos' => [[650000, 'Efectivo', '2026-10-10', 'COMP-0002']],
                'historial' => [
                    [$vendedorUsuarioId, 'Pendiente', 'Pedido creado', '2026-10-10 10:00:00'],
                    [$confirmadorUsuarioId, 'Confirmado', 'Datos y abono verificados', '2026-10-11 08:30:00'],
                    [$produccionUsuarioId, 'En producción', 'Pedido enviado a fabricación', '2026-10-12 08:00:00'],
                ],
            ]);

            // 3 · Entregado: 1 sofá 2 puestos + 1 silla de oficina = 1.550.000 (pagado completo)
            $pedido3Id = $crearPedido([
                'cliente' => $cliente3Id,
                'asesor' => $vendedorUsuarioId,
                'fecha' => '2026-09-25 09:00:00',
                'items' => [[$sofaDosPuestosId, 1], [$sillaOficinaId, 1]],
                'pagos' => [
                    [775000, 'Transferencia', '2026-09-25', 'COMP-0003'],
                    [775000, 'Efectivo', '2026-10-05', 'COMP-0004'],
                ],
                'historial' => [
                    [$vendedorUsuarioId, 'Pendiente', 'Pedido creado', '2026-09-25 09:00:00'],
                    [$confirmadorUsuarioId, 'Confirmado', 'Datos y abono verificados', '2026-09-25 15:00:00'],
                    [$produccionUsuarioId, 'En producción', 'Pedido enviado a fabricación', '2026-09-26 08:00:00'],
                    [$produccionUsuarioId, 'Finalizado', 'Control de calidad aprobado', '2026-10-03 17:00:00'],
                    [$administradorUsuarioId, 'Entregado', 'Pedido entregado al cliente', '2026-10-05 11:00:00'],
                ],
            ]);

            // 4 · Confirmado: 1 mesa comedor + 4 sillas comedor = 1.800.000
            $crearPedido([
                'cliente' => $cliente4Id,
                'asesor' => $vendedor2UsuarioId,
                'fecha' => '2026-10-22 11:00:00',
                'items' => [[$mesaId, 1], [$sillaId, 4]],
                'pagos' => [[900000, 'Transferencia', '2026-10-22', 'COMP-0005']],
                'historial' => [
                    [$vendedor2UsuarioId, 'Pendiente', 'Pedido creado', '2026-10-22 11:00:00'],
                    [$confirmadorUsuarioId, 'Confirmado', 'Datos y abono verificados', '2026-10-23 09:00:00'],
                ],
            ]);

            // 5 · Cancelado: 1 sofá 2 puestos = 1.100.000 (sin pagos)
            $crearPedido([
                'cliente' => $cliente5Id,
                'asesor' => $vendedor2UsuarioId,
                'fecha' => '2026-10-15 14:00:00',
                'items' => [[$sofaDosPuestosId, 1]],
                'historial' => [
                    [$vendedor2UsuarioId, 'Pendiente', 'Pedido creado', '2026-10-15 14:00:00'],
                    [$vendedor2UsuarioId, 'Cancelado', 'El cliente desistió de la compra', '2026-10-16 10:00:00'],
                ],
            ]);

            // 6 · Rechazado: 2 sillas de oficina = 900.000 (sin pagos)
            $crearPedido([
                'cliente' => $cliente4Id,
                'asesor' => $vendedorUsuarioId,
                'fecha' => '2026-10-24 16:00:00',
                'items' => [[$sillaOficinaId, 2]],
                'historial' => [
                    [$vendedorUsuarioId, 'Pendiente', 'Pedido creado', '2026-10-24 16:00:00'],
                    [$confirmadorUsuarioId, 'Rechazado', 'Dirección de entrega incompleta', '2026-10-25 09:00:00'],
                ],
            ]);

            // 7 · Pendiente: 1 sofá 3 puestos = 1.500.000 (abono de 500.000)
            $crearPedido([
                'cliente' => $cliente5Id,
                'asesor' => $vendedor2UsuarioId,
                'fecha' => '2026-10-27 10:00:00',
                'items' => [[$sofaId, 1]],
                'pagos' => [[500000, 'Efectivo', '2026-10-27', 'COMP-0006']],
                'historial' => [
                    [$vendedor2UsuarioId, 'Pendiente', 'Pedido creado', '2026-10-27 10:00:00'],
                ],
            ]);


            /*
            |--------------------------------------------------------------------------
            | PRODUCCIONES Y TRABAJOS DE TAPICERÍA
            |--------------------------------------------------------------------------
            | Solo en pedidos que ya pasaron por confirmación (2 y 3).
            */

            $produccionSillasId = DB::table('producciones')->insertGetId([
                'pedido_id' => $pedido2Id,
                'producto_id' => $sillaId,
                'usuario_id' => $produccionUsuarioId,
                'fecha_inicio' => '2026-10-12',
                'fecha_fin' => null,
                'estado' => 'En proceso',
                'observaciones' => 'Estructura lista, pendiente tapizado',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('producciones')->insert([
                'pedido_id' => $pedido2Id,
                'producto_id' => $mesaId,
                'usuario_id' => $produccionUsuarioId,
                'fecha_inicio' => '2026-10-12',
                'fecha_fin' => null,
                'estado' => 'Pendiente',
                'observaciones' => 'Esperando madera para la mesa',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $produccionSofaId = DB::table('producciones')->insertGetId([
                'pedido_id' => $pedido3Id,
                'producto_id' => $sofaDosPuestosId,
                'usuario_id' => $produccionUsuarioId,
                'fecha_inicio' => '2026-09-26',
                'fecha_fin' => '2026-10-03',
                'estado' => 'Finalizada',
                'observaciones' => 'Trabajo terminado correctamente',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('trabajos_tapiceros')->insert([
                [
                    'produccion_id' => $produccionSillasId,
                    'usuario_id' => $tapiceroUsuarioId,
                    'descripcion' => 'Tapizado de 2 sillas de comedor',
                    'fecha_inicio' => '2026-10-13',
                    'fecha_fin' => null,
                    'estado' => 'En proceso',
                    'observaciones' => 'Utilizar tela color gris',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'produccion_id' => $produccionSofaId,
                    'usuario_id' => $tapiceroUsuarioId,
                    'descripcion' => 'Tapizado del sofá de dos puestos',
                    'fecha_inicio' => '2026-09-28',
                    'fecha_fin' => '2026-10-02',
                    'estado' => 'Finalizado',
                    'observaciones' => 'Trabajo terminado',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        });
    }
}