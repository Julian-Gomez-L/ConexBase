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
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'    => $this->rolService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRolRequest $datos)
    {
        $registroInsertado = $this->rolService->store($datos->validated());

        return response()->json([
            'success'         => 'El rol se creó correctamente',
            'datosInsertados' => $registroInsertado
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $rol = $this->rolService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Rol consultado correctamente.',
            'data' => $rol
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRolRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El rol se actualizó correctamente',
            'data' => $this->rolService->update(
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
        $this->rolService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Rol eliminado correctamente.',
            'data' => null
        ]);
    }
}