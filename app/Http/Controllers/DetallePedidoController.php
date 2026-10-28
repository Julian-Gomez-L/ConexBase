<?php

namespace App\Http\Controllers;

use App\Services\DetallePedidoService;
use App\Http\Requests\DetallePedido\StoreDetallePedidoRequest;
use App\Http\Requests\DetallePedido\UpdateDetallePedidoRequest;

/**
 * @group Detalle de Pedidos
 *
 * Gestión de los detalles asociados a los pedidos.
 */
class DetallePedidoController extends Controller
{
    public function __construct(
        private DetallePedidoService $detallePedidoService
    ) {}

    public function index()
    {
        return response()->json([
            'success' => 'Los detalles de pedido se listaron correctamente',
            'data' => $this->detallePedidoService->list()
        ]);
    }

    public function store(StoreDetallePedidoRequest $request)
    {
        return response()->json([
            'success' => 'El detalle de pedido se creó correctamente',
            'data' => $this->detallePedidoService->store(
                $request->validated()
            )
        ]);
    }

    public function show(int $id)
    {
        $detallePedido = $this->detallePedidoService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Detalle de pedido consultado correctamente.',
            'data' => $detallePedido
        ]);
    }

    public function update(UpdateDetallePedidoRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El detalle de pedido se actualizó correctamente',
            'data' => $this->detallePedidoService->update(
                $request->validated(),
                $id
            )
        ]);
    }

    public function destroy($id)
    {
        $this->detallePedidoService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Detalle de pedido eliminado correctamente.',
            'data' => null
        ]);
    }
}