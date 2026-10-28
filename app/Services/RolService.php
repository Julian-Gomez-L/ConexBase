<?php

namespace App\Services;

use App\Interfaces\RolInterface;

class RolService extends BaseService
{
    public function __construct(RolInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'ROL';
    }

    protected function sustantivo(): string
    {
        return 'rol';
    }
}
