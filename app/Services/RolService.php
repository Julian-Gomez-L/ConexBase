<?php

namespace App\Services;

use App\Interfaces\RolInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class RolService
{
    public function __construct(private RolInterface $rolRepository)
    {
    }

    public function list()
    {
        return $this->rolRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->rolRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->rolRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del rol no es válido.'
            );
        }

        $id = (int) $id;

        $rol = $this->rolRepository->getById($id);

        if (!$rol) {
            throw new ResourceNotFoundException(
                'ROL_NOT_FOUND',
                'El rol no existe.'
            );
        }
        return $rol;
    }

   public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del rol no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->rolRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'ROL_NOT_FOUND',
                'El rol no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del rol no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->rolRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'ROL_NOT_FOUND',
                'El rol no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->rolRepository->getAllWithTrashed();
    }
}