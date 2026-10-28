<?php

namespace App\Http\Controllers;

use App\Services\ProduccionService;
use App\Http\Requests\Produccion\StoreProduccionRequest;
use App\Http\Requests\Produccion\UpdateProduccionRequest;


/**
 * @group Producciones
 *
 * Gestión de las producciones asociadas a los pedidos.
 */
class ProduccionController extends Controller
{
    public function __construct(private ProduccionService $produccionService)
    {}

    public function index()
    {
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'  => $this->produccionService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProduccionRequest $datos)
    {
        $registroInsertado = $this->produccionService->store($datos->validated());

        return response()->json([
            'success' => 'La producción se creó correctamente',
            'datosInsertados' => $registroInsertado
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $produccion = $this->produccionService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Producción consultada correctamente.',
            'data' => $produccion
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProduccionRequest $request, int $id)
    {
        return response()->json([
            'success' => 'La producción se actualizó correctamente',
            'data' => $this->produccionService->update(
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
        $this->produccionService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Producción eliminada correctamente.',
            'data' => null
        ]);
    }
}