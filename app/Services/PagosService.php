<?php

namespace App\Services;

use App\Interfaces\PagosInterface;

class PagosService extends BaseService
{
    public function __construct(PagosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'PAGO';
    }

    protected function sustantivo(): string
    {
        return 'pago';
    }
}
