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
        return $this->ok($this->produccionService->list(), 'Las producciones se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProduccionRequest $datos)
    {
        $registroInsertado = $this->produccionService->store($datos->validated());

        return $this->creado($registroInsertado, 'La producción se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $produccion = $this->produccionService->show($id);

        return $this->ok($produccion, 'Producción consultada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProduccionRequest $request, int $id)
    {
        return $this->ok($this->produccionService->update($request->validated(), $id), 'La producción se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->produccionService->destroy($id);
        return $this->ok(null, 'Producción eliminada correctamente.');
    }
}