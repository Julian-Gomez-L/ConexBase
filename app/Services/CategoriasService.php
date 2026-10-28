<?php

namespace App\Services;

use App\Interfaces\CategoriasInterface;

class CategoriasService extends BaseService
{
    public function __construct(CategoriasInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'CATEGORIA';
    }

    protected function sustantivo(): string
    {
        return 'categoría';
    }

    protected function femenino(): bool
    {
        return true;
    }
}
