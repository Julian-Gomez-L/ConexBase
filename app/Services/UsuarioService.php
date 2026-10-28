<?php

namespace App\Services;

use App\Interfaces\UsuarioInterface;

class UsuarioService extends BaseService
{
    public function __construct(UsuarioInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'USUARIO';
    }

    protected function sustantivo(): string
    {
        return 'usuario';
    }

    public function update(array $data, $id)
    {
        // Si no se envía una contraseña nueva, se conserva la actual
        if (empty($data['password'])) {
            unset($data['password']);
        }

        return parent::update($data, $id);
    }
}
