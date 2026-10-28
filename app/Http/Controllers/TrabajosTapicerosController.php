<?php

namespace App\Http\Controllers;

use App\Services\TrabajosTapicerosService;
use App\Http\Requests\TrabajosTapiceros\StoreTrabajosTapicerosRequest;
use App\Http\Requests\TrabajosTapiceros\UpdateTrabajosTapicerosRequest;


/**
 * @group Trabajos Tapiceros
 *
 * Gestión de los trabajos asignados a los tapiceros.
 */
class TrabajosTapicerosController extends Controller
{
    public function __construct(private TrabajosTapicerosService $trabajos_tapicerosService)
    {}

    public function index()
    {
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'  => $this->trabajos_tapicerosService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrabajosTapicerosRequest $datos)
    {
        $registroInsertado = $this->trabajos_tapicerosService->store($datos->validated());

        return response()->json([
            'success' => 'Los trabajos de tapiceros se crearon correctamente',
            'datosInsertados' => $registroInsertado
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $trabajo = $this->trabajos_tapicerosService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo de tapicero consultado correctamente.',
            'data' => $trabajo
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrabajosTapicerosRequest $request, int $id)
    {
        return response()->json([
            'success' => 'Los trabajos de tapiceros se actualizaron correctamente',
            'data' => $this->trabajos_tapicerosService->update(
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
        $this->trabajos_tapicerosService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Trabajo de tapicero eliminado correctamente.',
            'data' => null
        ]);
    }
}