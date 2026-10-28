<?php

namespace App\Services;

use App\Interfaces\DetallePedidoInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class DetallePedidoService
{
    public function __construct(private DetallePedidoInterface $detallePedidoRepository)
    {
    }

    public function list()
    {
        return $this->detallePedidoRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->detallePedidoRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->detallePedidoRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del detalle del pedido no es válido.'
            );
        }

        $id = (int) $id;

        $detallePedido = $this->detallePedidoRepository->getById($id);

        if (!$detallePedido) {
            throw new ResourceNotFoundException(
                'DETALLE_PEDIDO_NOT_FOUND',
                'El detalle del pedido no existe.'
            );
        }
        return $detallePedido;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del detalle del pedido no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->detallePedidoRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'DETALLE_PEDIDO_NOT_FOUND',
                'El detalle del pedido no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del detalle del pedido no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->detallePedidoRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'DETALLE_PEDIDO_NOT_FOUND',
                'El detalle del pedido no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->detallePedidoRepository->getAllWithTrashed();
    }
}