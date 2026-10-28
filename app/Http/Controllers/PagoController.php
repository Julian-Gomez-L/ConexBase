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
        return response()->json([
            'success' => 'Los pagos se listaron correctamente',
            'data' => $this->pagosService->list()
        ]);
    }

    public function store(StorePagoRequest $request)
    {
        return response()->json([
            'success' => 'El pago se creó correctamente',
            'data' => $this->pagosService->store($request->validated())
        ]);
    }

    public function show($id)
    {
        $pago = $this->pagosService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Pago consultado correctamente.',
            'data' => $pago
        ]);
    }

    public function update(UpdatePagoRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El pago se actualizó correctamente',
            'data' => $this->pagosService->update(
                $request->validated(),
                $id
            )
        ]);
    }

    public function destroy($id)
    {
        $this->pagosService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Pago eliminado correctamente.',
            'data' => null
        ]);
    }

    public function getAllWithTrashed()
    {
        $pagos = $this->pagosService->getAllWithTrashed();

        return response()->json([
            'success' => true,
            'message' => 'Pagos consultados correctamente.',
            'data' => $pagos
        ]);
    }
}