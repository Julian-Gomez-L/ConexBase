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
        return $this->ok($this->usuarioService->list(), 'Los usuarios se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUsuarioRequest $datos)
    {
        $registroInsertado = $this->usuarioService->store($datos->validated());

        return $this->creado($registroInsertado, 'El usuario se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $usuario = $this->usuarioService->show($id);

        return $this->ok($usuario, 'Usuario consultado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUsuarioRequest $request, int $id)
    {
        return $this->ok($this->usuarioService->update($request->validated(), $id), 'El usuario se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->usuarioService->destroy($id);
        return $this->ok(null, 'Usuario eliminado correctamente.');
    }
}