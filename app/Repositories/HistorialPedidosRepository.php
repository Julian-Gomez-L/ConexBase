<?php

namespace App\Repositories;

use App\Interfaces\HistorialPedidosInterface;
use App\Models\HistorialPedidos;

class HistorialPedidosRepository extends BaseRepository implements HistorialPedidosInterface
{
    public function __construct(HistorialPedidos $historialPedidosModel)
    {
        parent::__construct($historialPedidosModel);
    }

}