<?php

namespace App\Http\Controllers;

use App\Services\ProductoService;
use App\Http\Requests\Producto\StoreProductoRequest;
use App\Http\Requests\Producto\UpdateProductoRequest;


/**
 * @group Productos
 *
 * Gestión de los productos del sistema.
 */
class ProductoController extends Controller
{
    public function __construct(private ProductoService $productoService)
    {}

    public function index()
    {
        return response()->json([
            'success' => 'Se listaron correctamente',
            'data'  => $this->productoService->list()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductoRequest $datos)
    {
        $registroInsertado = $this->productoService->store($datos->validated());

        return response()->json([
            'success' => 'El producto se creó correctamente',
            'datosInsertados' => $registroInsertado
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $producto = $this->productoService->show($id);

        return response()->json([
            'success' => true,
            'message' => 'Producto consultado correctamente.',
            'data' => $producto
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductoRequest $request, int $id)
    {
        return response()->json([
            'success' => 'El producto se actualizó correctamente',
            'data' => $this->productoService->update(
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
        $this->productoService->destroy($id);
        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado correctamente.',
            'data' => null
        ]);
    }
}