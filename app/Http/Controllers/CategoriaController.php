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
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'    => $this->categoriaService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoriaRequest $datos)
    {
        $registroInsertado = $this->categoriaService->store($datos->validated());

        return response()->json([
            'success'         => 'La categoría se creó correctamente',
            'datosInsertados' => $registroInsertado
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
   $categoria = $this->categoriaService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Categoría consultada correctamente.',
            'data' => $categoria
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoriaRequest $request, int $id)
    {
        return response()->json([
            'success' => 'La categoría se actualizó correctamente',
            'data' => $this->categoriaService->update(
                $request->validated(),
                $id
            )
        ]);
    }

    public function destroy($id)
    {
        $this->categoriaService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada correctamente.',
            'data' => null
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    
}


