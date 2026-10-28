<?php

namespace App\Services;

use App\Interfaces\CategoriasInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class CategoriasService
{
    public function __construct(private CategoriasInterface $categoriasRepository)
    {
    }

    public function list()
    {
        return $this->categoriasRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->categoriasRepository->create($data);
    }

    public function show($id)
    {

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id //!== significa que no es un número entero positivo
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador de la categoría no es válido.'
            );
        }

        $id = (int) $id;

        $categoria = $this->categoriasRepository->getById($id);

        if (!$categoria) {
            throw new ResourceNotFoundException(
                'CATEGORIA_NOT_FOUND',
                'La categoría no existe.'
            );
        }
        return $categoria;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador de la categoría no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->categoriasRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'CATEGORIA_NOT_FOUND',
                'La categoría no existe y no puede ser actualizada.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador de la categoría no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->categoriasRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'CATEGORIA_NOT_FOUND',
                'La categoría no existe y no puede ser eliminada.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->categoriasRepository->getAllWithTrashed();
    }
}
 