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
        return $this->ok($this->productoService->list(), 'Los productos se listaron correctamente.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductoRequest $datos)
    {
        $registroInsertado = $this->productoService->store($datos->validated());

        return $this->creado($registroInsertado, 'El producto se creó correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $producto = $this->productoService->show($id);

        return $this->ok($producto, 'Producto consultado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductoRequest $request, int $id)
    {
        return $this->ok($this->productoService->update($request->validated(), $id), 'El producto se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->productoService->destroy($id);
        return $this->ok(null, 'Producto eliminado correctamente.');
    }
}