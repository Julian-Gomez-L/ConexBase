<?php

namespace App\Services;

use App\Interfaces\ProduccionInterface;

class ProduccionService extends BaseService
{
    public function __construct(ProduccionInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'PRODUCCION';
    }

    protected function sustantivo(): string
    {
        return 'producción';
    }

    protected function femenino(): bool
    {
        return true;
    }
}
