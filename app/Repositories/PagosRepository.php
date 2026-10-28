<?php

namespace App\Repositories;

use App\Interfaces\PagosInterface;
use App\Models\Pago;

class PagosRepository extends BaseRepository implements PagosInterface
{
    public function __construct(Pago $produccionModel)
    {
        parent::__construct($produccionModel);
    }

}