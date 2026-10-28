<?php

namespace App\Services;

use App\Interfaces\DetallePedidoInterface;

class DetallePedidoService extends BaseService
{
    public function __construct(DetallePedidoInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'DETALLE_PEDIDO';
    }

    protected function sustantivo(): string
    {
        return 'detalle del pedido';
    }
}
