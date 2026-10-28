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
        return $this->ok($this->detallePedidoService->list(), 'Los detalles de pedido se listaron correctamente.');
    }

    public function store(StoreDetallePedidoRequest $request)
    {
        return $this->creado($this->detallePedidoService->store($request->validated()), 'El detalle de pedido se creó correctamente.');
    }

    public function show(int $id)
    {
        $detallePedido = $this->detallePedidoService->show($id);

        return $this->ok($detallePedido, 'Detalle de pedido consultado correctamente.');
    }

    public function update(UpdateDetallePedidoRequest $request, int $id)
    {
        return $this->ok($this->detallePedidoService->update($request->validated(), $id), 'El detalle de pedido se actualizó correctamente.');
    }

    public function destroy($id)
    {
        $this->detallePedidoService->destroy($id);
        return $this->ok(null, 'Detalle de pedido eliminado correctamente.');
    }
}