<?php

namespace App\Repositories;


use App\Interfaces\PedidosInterface;
use App\Models\Pedido;

class PedidosRepository extends BaseRepository implements PedidosInterface
{
    public function __construct(Pedido $pedidosModel)
    {
        parent::__construct($pedidosModel);
    }

}