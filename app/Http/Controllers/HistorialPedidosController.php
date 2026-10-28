<?php

namespace App\Http\Controllers;

use App\Services\HistorialPedidosService;
use App\Http\Requests\HistorialPedidos\StoreHistorialPedidosRequest;
use App\Http\Requests\HistorialPedidos\UpdateHistorialPedidosRequest;


/**
 * @group Historial de Pedidos
 *
 * Gestión del historial de los pedidos.
 */
class HistorialPedidosController extends Controller
{
    public function __construct(private HistorialPedidosService $historialPedidosService)
    {}

    public function index()
    {
        return $this->ok($this->historialPedidosService->list(), 'Los historiales de pedidos se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreHistorialPedidosRequest $datos)
    {
        $registroInsertado = $this->historialPedidosService->store($datos->validated());

        return $this->creado($registroInsertado, 'El historial de pedidos se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $historialPedido = $this->historialPedidosService->show($id);

        return $this->ok($historialPedido, 'Historial de pedidos consultado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateHistorialPedidosRequest $request, int $id)
    {
        return $this->ok($this->historialPedidosService->update($request->validated(), $id), 'El historial de pedidos se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->historialPedidosService->destroy($id);
        return $this->ok(null, 'Historial de pedidos eliminado correctamente.');
    }
}