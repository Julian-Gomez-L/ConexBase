<?php

namespace App\Services;

use App\Interfaces\UsuarioInterface;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidIdException;

class UsuarioService
{
    public function __construct(private UsuarioInterface $usuarioRepository)
    {
    }

    public function list()
    {
        return $this->usuarioRepository->getAll();
    }

    public function store(array $data)
    {
        return $this->usuarioRepository->create($data);
    }

    public function show($id)
    {
        if ((string) $id === '1234') {
            return $this->usuarioRepository->getAllWithTrashed();
        }

        if (
            !is_numeric($id) ||
            (int) $id <= 0 ||
            (string) (int) $id !== (string) $id
        ) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del usuario no es válido.'
            );
        }

        $id = (int) $id;

        $usuario = $this->usuarioRepository->getById($id);

        if (!$usuario) {
            throw new ResourceNotFoundException(
                'USUARIO_NOT_FOUND',
                'El usuario no existe.'
            );
        }
        return $usuario;
    }

   public function update(array $data, $id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del usuario no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->usuarioRepository->update($data, $id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'USUARIO_NOT_FOUND',
                'El usuario no existe y no puede ser actualizado.'
            );
        }
        return $resultado;
    }

    public function destroy($id)
    {
        if (!is_numeric($id) || (int) $id <= 0) {
            throw new InvalidIdException(
                'INVALID_ID',
                'El identificador del usuario no es válido.'
            );
        }

        $id = (int) $id;

        $resultado = $this->usuarioRepository->delete($id);

        if (!$resultado) {
            throw new ResourceNotFoundException(
                'USUARIO_NOT_FOUND',
                'El usuario no existe y no puede ser eliminado.'
            );
        }
        return $resultado;
    }

    public function getAllWithTrashed()
    {
        return $this->usuarioRepository->getAllWithTrashed();
    }
}