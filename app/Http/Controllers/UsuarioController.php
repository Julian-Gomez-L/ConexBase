<?php

namespace App\Http\Controllers;

use App\Services\UsuarioService;
use App\Http\Requests\Usuario\StoreUsuarioRequest;
use App\Http\Requests\Usuario\UpdateUsuarioRequest;


/**
 * @group Usuarios
 *
 * Gestión de los usuarios del sistema.
 */
class UsuarioController extends Controller
{
    public function __construct(private UsuarioService $usuarioService)
    {}

    public function index()
    {
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'    => $this->usuarioService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUsuarioRequest $datos)
    {
        $registroInsertado = $this->usuarioService->store($datos->validated());

        return response()->json([
            'success'         => 'El usuario se creó correctamente',
            'datosInsertados' => $registroInsertado
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $usuario = $this->usuarioService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Usuario consultado correctamente.',
            'data' => $usuario
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUsuarioRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El usuario se actualizó correctamente',
            'data' => $this->usuarioService->update(
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
        $this->usuarioService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente.',
            'data' => null
        ]);
    }
}