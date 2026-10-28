<?php

namespace App\Services;

use App\Interfaces\ProductosInterface;

class ProductoService extends BaseService
{
    public function __construct(ProductosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'PRODUCTO';
    }

    protected function sustantivo(): string
    {
        return 'producto';
    }
}
