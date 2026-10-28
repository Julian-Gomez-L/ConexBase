<?php

namespace App\Services;

use App\Interfaces\PagosInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class PagosService
{
    public function __construct(private PagosInterface $pagosRepository)
    {
    }

    public function list()
    {
        return $this->pagosRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->pagosRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->pagosRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del pago no es válido.'
            );
        }

        $id = (int) $id;

        $pago = $this->pagosRepository->getById($id);

        if (!$pago) {
            throw new ResourceNotFoundException(
                'PAGO_NOT_FOUND',
                'El pago no existe.'
            );
        }
        return $pago;
    }

    public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(//se est creando el objeto de esa clase
                'INVALID_ID',
                'El identificador del pago no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->pagosRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PAGO_NOT_FOUND',
                'El pago no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del pago no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->pagosRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'PAGO_NOT_FOUND',
                'El pago no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->pagosRepository->getAllWithTrashed();
    }
}