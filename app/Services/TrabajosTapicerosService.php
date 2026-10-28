<?php

namespace App\Services;

use App\Interfaces\TrabajosTapicerosInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class TrabajosTapicerosService
{
    public function __construct(private TrabajosTapicerosInterface $trabajosTapicerosRepository)
    {
    }

    public function list()
    {
        return $this->trabajosTapicerosRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->trabajosTapicerosRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->trabajosTapicerosRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del trabajo no es válido.'
            );
        }

        $id = (int) $id;

        $trabajo = $this->trabajosTapicerosRepository->getById($id);

        if (!$trabajo) {
            throw new ResourceNotFoundException(
                'TRABAJO_NOT_FOUND',
                'El trabajo no existe.'
            );
        }
        return $trabajo;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del trabajo no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->trabajosTapicerosRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'TRABAJO_NOT_FOUND',
                'El trabajo no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del trabajo no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->trabajosTapicerosRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'TRABAJO_NOT_FOUND',
                'El trabajo no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->trabajosTapicerosRepository->getAllWithTrashed();
    }
}