<?php

namespace App\Repositories;

use App\Interfaces\DetallePedidoInterface;
use App\Models\DetallePedido;

class DetallePedidoRepository extends BaseRepository implements DetallePedidoInterface
{
    public function __construct(DetallePedido $detallePedidoModel)
    {
        parent::__construct($detallePedidoModel);
    }

}