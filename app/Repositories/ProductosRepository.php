<?php

namespace App\Repositories;

use App\Interfaces\ProductosInterface;
use App\Models\Producto;

class ProductosRepository extends BaseRepository implements ProductosInterface
{
    public function __construct(Producto $productosModel)
    {
        parent::__construct($productosModel);
    }

}
