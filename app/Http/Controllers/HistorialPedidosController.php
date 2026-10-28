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
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'  => $this->historialPedidosService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreHistorialPedidosRequest $datos)
    {
        $registroInsertado = $this->historialPedidosService->store($datos->validated());

        return response()->json([
            'success' => 'El historial de pedidos se creó correctamente',
            'datosInsertados' => $registroInsertado
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $historialPedido = $this->historialPedidosService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Historial de pedidos consultado correctamente.',
            'data' => $historialPedido
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateHistorialPedidosRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El historial de pedidos se actualizó correctamente',
            'data' => $this->historialPedidosService->update(
                $request->validated(),
                $id
            )
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->historialPedidosService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Historial de pedidos eliminado correctamente.',
            'data' => null
        ]);
    }
}