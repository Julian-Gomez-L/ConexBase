<?php

namespace App\Http\Controllers;

use App\Services\PedidosService;
use App\Http\Requests\Pedido\StorePedidoRequest;
use App\Http\Requests\Pedido\UpdatePedidoRequest;

/**
 * @group Pedidos
 *
 * Gestión de los pedidos del sistema.
 */
class PedidoController extends Controller
{
    public function __construct(
        private PedidosService $pedidosService
    ) {
    }

    public function index()
    {
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data' => $this->pedidosService->list()
        ]);
    }

    public function store(StorePedidoRequest $request)
    {
        return response()->json([
            'success' => 'El pedido se creó correctamente',
            'data' => $this->pedidosService->store($request->validated())
        ]);
    }

    public function show(int $id)
    {
        $pedido = $this->pedidosService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Pedido consultado correctamente.',
            'data' => $pedido
        ]);
    }

    public function update(UpdatePedidoRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El pedido se actualizó correctamente',
            'data' => $this->pedidosService->update(
                $request->validated(),
                $id
            )
        ]);
    }

    public function destroy($id)
    {
        $this->pedidosService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Pedido eliminado correctamente.',
            'data' => null
        ]);
    }
}