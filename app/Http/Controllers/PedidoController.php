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
        return $this->ok($this->pedidosService->list(), 'Los pedidos se listaron correctamente.');
    }

    public function store(StorePedidoRequest $request)
    {
        return $this->creado($this->pedidosService->store($request->validated()), 'El pedido se creó correctamente.');
    }

    public function show(int $id)
    {
        $pedido = $this->pedidosService->show($id);

        return $this->ok($pedido, 'Pedido consultado correctamente.');
    }

    public function update(UpdatePedidoRequest $request, int $id)
    {
        return $this->ok($this->pedidosService->update($request->validated(), $id), 'El pedido se actualizó correctamente.');
    }

    public function destroy($id)
    {
        $this->pedidosService->destroy($id);
        return $this->ok(null, 'Pedido eliminado correctamente.');
    }
}