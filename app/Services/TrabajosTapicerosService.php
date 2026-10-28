<?php

namespace App\Services;

use App\Interfaces\TrabajosTapicerosInterface;

class TrabajosTapicerosService extends BaseService
{
    public function __construct(TrabajosTapicerosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'TRABAJO';
    }

    protected function sustantivo(): string
    {
        return 'trabajo';
    }
}
