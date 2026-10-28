<?php

namespace App\Repositories;

use App\Interfaces\ProduccionInterface;
use App\Models\Produccion;

class ProduccionRepository extends BaseRepository implements ProduccionInterface
{
    public function __construct(Produccion $produccionModel)
    {
        parent::__construct($produccionModel);
    }

}
