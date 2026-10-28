<?php

namespace App\Http\Controllers;

use App\Services\RolService;
use App\Http\Requests\Rol\StoreRolRequest;
use App\Http\Requests\Rol\UpdateRolRequest;


/**
 * @group Roles
 *
 * Gestión de los roles del sistema.
 */
class RolController extends Controller
{
    public function __construct(private RolService $rolService)
    {}

    public function index()
    {
        return $this->ok($this->rolService->list(), 'Los roles se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRolRequest $datos)
    {
        $registroInsertado = $this->rolService->store($datos->validated());

        return $this->creado($registroInsertado, 'El rol se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $rol = $this->rolService->show($id);

        return $this->ok($rol, 'Rol consultado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRolRequest $request, int $id)
    {
        return $this->ok($this->rolService->update($request->validated(), $id), 'El rol se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->rolService->destroy($id);
        return $this->ok(null, 'Rol eliminado correctamente.');
    }
}