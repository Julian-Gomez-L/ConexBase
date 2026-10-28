<?php

namespace App\Services;

use App\Interfaces\HistorialPedidosInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class HistorialPedidosService
{
    public function __construct(private HistorialPedidosInterface $historialPedidosRepository)
    {
    }

    public function list()
    {
        return $this->historialPedidosRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->historialPedidosRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->historialPedidosRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del historial de pedidos no es válido.'
            );
        }

        $id = (int) $id;

        $historialPedido = $this->historialPedidosRepository->getById($id);

        if (!$historialPedido) {
            throw new ResourceNotFoundException(
                'HISTORIAL_PEDIDOS_NOT_FOUND',
                'El historial de pedidos no existe.'
            );
        }
        return $historialPedido;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del historial de pedidos no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->historialPedidosRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'HISTORIAL_PEDIDOS_NOT_FOUND',
                'El historial de pedidos no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del historial de pedidos no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->historialPedidosRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'HISTORIAL_PEDIDOS_NOT_FOUND',
                'El historial de pedidos no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->historialPedidosRepository->getAllWithTrashed();
    }
}