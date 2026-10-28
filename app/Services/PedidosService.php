<?php

namespace App\Services;

use App\Interfaces\PedidosInterface;

class PedidosService extends BaseService
{
    public function __construct(PedidosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'PEDIDO';
    }

    protected function sustantivo(): string
    {
        return 'pedido';
    }
}
