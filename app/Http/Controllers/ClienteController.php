<?php

namespace App\Http\Controllers;

use App\Services\ClientesService;
use App\Http\Requests\Cliente\StoreClienteRequest;
use App\Http\Requests\Cliente\UpdateClienteRequest;


/**
 * @group Clientes
 *
 * Gestión de los clientes del sistema.
 */
class ClienteController extends Controller
{
    public function __construct(private ClientesService $clientesService)
    {}

    public function index()
    {
        return $this->ok($this->clientesService->list(), 'Los clientes se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClienteRequest $datos)
    {
        $registroInsertado = $this->clientesService->store($datos->validated());

        return $this->creado($registroInsertado, 'El cliente se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
      $cliente = $this->clientesService->show($id);

        return $this->ok($cliente, 'Cliente consultado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClienteRequest $request, int $id)
    {
        return $this->ok($this->clientesService->update($request->validated(), $id), 'El cliente se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->clientesService->destroy($id);
        return $this->ok(null, 'Cliente eliminado correctamente.');
    }
}