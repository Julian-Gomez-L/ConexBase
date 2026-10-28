<?php

namespace App\Http\Controllers;

use App\Services\PagosService;
use App\Http\Requests\Pago\StorePagoRequest;
use App\Http\Requests\Pago\UpdatePagoRequest;

/**
 * @group Pagos
 *
 * Gestión de los pagos asociados a los pedidos.
 */
class PagoController extends Controller
{
    public function __construct(
        private PagosService $pagosService
    ) {
    }

    public function index()
    {
        return $this->ok($this->pagosService->list(), 'Los pagos se listaron correctamente.');
    }

    public function store(StorePagoRequest $request)
    {
        return $this->creado($this->pagosService->store($request->validated()), 'El pago se creó correctamente.');
    }

    public function show($id)
    {
        $pago = $this->pagosService->show($id);

        return $this->ok($pago, 'Pago consultado correctamente.');
    }

    public function update(UpdatePagoRequest $request, int $id)
    {
        return $this->ok($this->pagosService->update($request->validated(), $id), 'El pago se actualizó correctamente.');
    }

    public function destroy($id)
    {
        $this->pagosService->destroy($id);
        return $this->ok(null, 'Pago eliminado correctamente.');
    }
}