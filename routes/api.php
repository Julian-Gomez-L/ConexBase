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

// Autenticación (pública, con límite de 5 intentos por minuto)
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Todo lo demás exige token Bearer
Route::middleware('auth.token')->group(function () {

    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Roles y usuarios: cualquier usuario autenticado puede consultar; solo el Administrador modifica
    Route::apiResource('roles', RolController::class)->only(['index', 'show']);
    Route::apiResource('usuarios', UsuarioController::class)->only(['index', 'show']);

    Route::middleware('rol:Administrador')->group(function () {
        Route::apiResource('roles', RolController::class)->except(['index', 'show']);
        Route::apiResource('usuarios', UsuarioController::class)->except(['index', 'show']);
    });

    // Resto de entidades
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('pedidos', PedidoController::class);
    Route::apiResource('detalle-pedidos', DetallePedidoController::class);
    Route::apiResource('pagos', PagoController::class);
    Route::apiResource('producciones', ProduccionController::class);
    Route::apiResource('trabajos-tapiceros', TrabajosTapicerosController::class);
    Route::apiResource('historial-pedidos', HistorialPedidosController::class);
});
