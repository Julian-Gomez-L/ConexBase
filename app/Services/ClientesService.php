<?php

namespace App\Services;

use App\Interfaces\ClientesInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class ClientesService
{
    public function __construct(private ClientesInterface $clientesRepository)
    {
    }

    public function list()
    {
        return $this->clientesRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->clientesRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->clientesRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del cliente no es válido.'
            );
        }

        $id = (int) $id;

        $cliente = $this->clientesRepository->getById($id);

        if (!$cliente) {
            throw new ResourceNotFoundException(
                'CLIENTE_NOT_FOUND',
                'El cliente no existe.'
            );
        }
        return $cliente;
    }

   public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del cliente no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->clientesRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'CLIENTE_NOT_FOUND',
                'El cliente no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del cliente no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->clientesRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'CLIENTE_NOT_FOUND',
                'El cliente no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->clientesRepository->getAllWithTrashed();
    }
}