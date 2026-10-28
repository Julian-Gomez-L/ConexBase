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
        return $this->ok($this->trabajos_tapicerosService->list(), 'Los trabajos de tapiceros se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrabajosTapicerosRequest $datos)
    {
        $registroInsertado = $this->trabajos_tapicerosService->store($datos->validated());

        return $this->creado($registroInsertado, 'Los trabajos de tapiceros se crearon correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $trabajo = $this->trabajos_tapicerosService->show($id);

        return $this->ok($trabajo, 'Trabajo de tapicero consultado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrabajosTapicerosRequest $request, int $id)
    {
        return $this->ok($this->trabajos_tapicerosService->update($request->validated(), $id), 'Los trabajos de tapiceros se actualizaron correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->trabajos_tapicerosService->destroy($id);
        return $this->ok(null, 'Trabajo de tapicero eliminado correctamente.');
    }
}