<?php

namespace App\Services;

use App\Interfaces\HistorialPedidosInterface;

class HistorialPedidosService extends BaseService
{
    public function __construct(HistorialPedidosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'HISTORIAL_PEDIDOS';
    }

    protected function sustantivo(): string
    {
        return 'historial de pedidos';
    }
}
