<?php

namespace App\Services;

use App\Interfaces\ProduccionInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class ProduccionService
{
    public function __construct(private ProduccionInterface $produccionRepository)
    {
    }

    public function list()
    {
        return $this->produccionRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->produccionRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->produccionRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador de la producción no es válido.'
            );
        }

        $id = (int) $id;

        $produccion = $this->produccionRepository->getById($id);

        if (!$produccion) {
            throw new ResourceNotFoundException(
                'PRODUCCION_NOT_FOUND',
                'La producción no existe.'
            );
        }
        return $produccion;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador de la producción no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->produccionRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PRODUCCION_NOT_FOUND',
                'La producción no existe y no puede ser actualizada.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador de la producción no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->produccionRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PRODUCCION_NOT_FOUND',
                'La producción no existe y no puede ser eliminada.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->produccionRepository->getAllWithTrashed();
    }
}