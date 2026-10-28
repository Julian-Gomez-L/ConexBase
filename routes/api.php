<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\DetallePedidoController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\ProduccionController;
use App\Http\Controllers\TrabajosTapicerosController;
use App\Http\Controllers\HistorialPedidosController;
use App\Support\Roles;

/*
|--------------------------------------------------------------------------
| Permisos por rol
|--------------------------------------------------------------------------
| - LECTURA (index, show): cualquier usuario autenticado. Las pantallas del
|   frontend combinan varios recursos (pedidos + clientes + pagos...).
| - ESCRITURA (store, update): solo los roles que intervienen en ese proceso.
| - ELIMINAR (destroy): solo el Administrador (es borrado lógico).
|
| Los nombres de rol están en App\Support\Roles. Pendiente: Policies para reglas por registro,
| p. ej. "un vendedor solo edita sus propios pedidos".
*/

// Autenticación (pública, con límite de 5 intentos por minuto)
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Todo lo demás exige token Bearer
Route::middleware('auth.token')->group(function () {

    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // ── Lectura: cualquier usuario autenticado ──────────────────────────
    Route::apiResource('roles', RolController::class)->only(['index', 'show']);
    Route::apiResource('usuarios', UsuarioController::class)->only(['index', 'show']);
    Route::apiResource('clientes', ClienteController::class)->only(['index', 'show']);
    Route::apiResource('categorias', CategoriaController::class)->only(['index', 'show']);
    Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);
    Route::apiResource('pedidos', PedidoController::class)->only(['index', 'show']);
    Route::apiResource('detalle-pedidos', DetallePedidoController::class)->only(['index', 'show']);
    Route::apiResource('pagos', PagoController::class)->only(['index', 'show']);
    Route::apiResource('producciones', ProduccionController::class)->only(['index', 'show']);
    Route::apiResource('trabajos-tapiceros', TrabajosTapicerosController::class)->only(['index', 'show']);
    Route::apiResource('historial-pedidos', HistorialPedidosController::class)->only(['index', 'show']);

    // ── Administrador: control total del catálogo, usuarios y eliminación ──
    Route::middleware(Roles::middleware(Roles::ADMIN))->group(function () {
        Route::apiResource('roles', RolController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('usuarios', UsuarioController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('categorias', CategoriaController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('productos', ProductoController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('historial-pedidos', HistorialPedidosController::class)->only(['update', 'destroy']);

        Route::apiResource('clientes', ClienteController::class)->only(['destroy']);
        Route::apiResource('pedidos', PedidoController::class)->only(['destroy']);
        Route::apiResource('detalle-pedidos', DetallePedidoController::class)->only(['destroy']);
        Route::apiResource('pagos', PagoController::class)->only(['update', 'destroy']);
        Route::apiResource('producciones', ProduccionController::class)->only(['destroy']);
        Route::apiResource('trabajos-tapiceros', TrabajosTapicerosController::class)->only(['destroy']);
    });

    // ── Ventas: registrar clientes, pedidos, sus detalles y el pago inicial ──
    Route::middleware(Roles::middleware(Roles::ADMIN, Roles::VENDEDOR))->group(function () {
        Route::apiResource('clientes', ClienteController::class)->only(['store', 'update']);
        Route::apiResource('detalle-pedidos', DetallePedidoController::class)->only(['store', 'update']);
        Route::apiResource('pagos', PagoController::class)->only(['store']);
        Route::apiResource('pedidos', PedidoController::class)->only(['store']);
    });

    // ── Pedidos: el confirmador los aprueba/rechaza (cambia el estado) ──
    Route::middleware(Roles::middleware(Roles::ADMIN, Roles::VENDEDOR, Roles::CONFIRMADOR))->group(function () {
        Route::apiResource('pedidos', PedidoController::class)->only(['update']);
    });

    // ── Producción: gestiona producciones y asigna trabajos a tapiceros ──
    Route::middleware(Roles::middleware(Roles::ADMIN, Roles::PRODUCCION))->group(function () {
        Route::apiResource('producciones', ProduccionController::class)->only(['store', 'update']);
        Route::apiResource('trabajos-tapiceros', TrabajosTapicerosController::class)->only(['store']);
    });

    // ── Historial: lo registra quien cambia el estado de un pedido ──
    Route::middleware(Roles::middleware(Roles::ADMIN, Roles::VENDEDOR, Roles::CONFIRMADOR, Roles::PRODUCCION))->group(function () {
        Route::apiResource('historial-pedidos', HistorialPedidosController::class)->only(['store']);
    });

    // ── Tapicería: el tapicero reporta avance de sus trabajos ──
    Route::middleware(Roles::middleware(Roles::ADMIN, Roles::PRODUCCION, Roles::TAPICERO))->group(function () {
        Route::apiResource('trabajos-tapiceros', TrabajosTapicerosController::class)->only(['update']);
    });
});
