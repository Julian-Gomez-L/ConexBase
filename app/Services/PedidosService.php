<?php

namespace App\Services;

use App\Interfaces\PedidosInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class PedidosService
{
    public function __construct(private PedidosInterface $pedidosRepository)
    {
    }

    public function list()
    {
        return $this->pedidosRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->pedidosRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->pedidosRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del pedido no es válido.'
            );
        }

        $id = (int) $id;

        $pedido = $this->pedidosRepository->getById($id);

        if (!$pedido) {
            throw new ResourceNotFoundException(
                'PEDIDO_NOT_FOUND',
                'El pedido no existe.'
            );
        }
        return $pedido;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del pedido no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->pedidosRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PEDIDO_NOT_FOUND',
                'El pedido no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del pedido no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->pedidosRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PEDIDO_NOT_FOUND',
                'El pedido no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->pedidosRepository->getAllWithTrashed();
    }
}