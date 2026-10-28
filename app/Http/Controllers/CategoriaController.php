<?php

namespace App\Http\Controllers;

use App\Services\CategoriasService;
use App\Http\Requests\Categoria\StoreCategoriaRequest;
use App\Http\Requests\Categoria\UpdateCategoriaRequest;


/**
 * @group Categorías
 *
 * Gestión de las categorías de productos.
 */
class CategoriaController extends Controller
{
    public function __construct(private CategoriasService $categoriaService)
    {}

    public function index()
    {
        return $this->ok($this->categoriaService->list(), 'Las categorías se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoriaRequest $datos)
    {
        $registroInsertado = $this->categoriaService->store($datos->validated());

        return $this->creado($registroInsertado, 'La categoría se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
   $categoria = $this->categoriaService->show($id);

        return $this->ok($categoria, 'Categoría consultada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoriaRequest $request, int $id)
    {
        return $this->ok($this->categoriaService->update($request->validated(), $id), 'La categoría se actualizó correctamente.');
    }

    public function destroy($id)
    {
        $this->categoriaService->destroy($id);
        return $this->ok(null, 'Categoría eliminada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    
}


