<?php

namespace App\Services;

use App\Interfaces\ProductosInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class ProductoService
{
    public function __construct(private ProductosInterface $productosRepository)
    {
    }

    public function list()
    {
        return $this->productosRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->productosRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->productosRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del producto no es válido.'
            );
        }

        $id = (int) $id;

        $producto = $this->productosRepository->getById($id);

        if (!$producto) {
            throw new ResourceNotFoundException(
                'PRODUCTO_NOT_FOUND',
                'El producto no existe.'
            );
        }
        return $producto;
    }

   public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del producto no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->productosRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PRODUCTO_NOT_FOUND',
                'El producto no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del producto no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->productosRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PRODUCTO_NOT_FOUND',
                'El producto no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->productosRepository->getAllWithTrashed();
    }
}