<?php

namespace App\Repositories;

use App\Interfaces\IntentosLoginInterface;
use App\Models\IntentoLogin;

class IntentosLoginRepository extends BaseRepository implements IntentosLoginInterface
{
    public function __construct(IntentoLogin $model)
    {
        parent::__construct($model);
    }

    public function recientes(int $limite)
    {
        return $this->model
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->limit($limite)
            ->get();
    }
}
