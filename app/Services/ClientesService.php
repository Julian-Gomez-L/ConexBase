<?php

namespace App\Services;

use App\Interfaces\ClientesInterface;

class ClientesService extends BaseService
{
    public function __construct(ClientesInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'CLIENTE';
    }

    protected function sustantivo(): string
    {
        return 'cliente';
    }
}
