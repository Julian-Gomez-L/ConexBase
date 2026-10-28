<?php

namespace App\Repositories;

use App\Interfaces\RolInterface;
use App\Models\Rol;

class RolRepository extends BaseRepository implements RolInterface
{
    public function __construct(Rol $RolModel)
    {
        parent::__construct($RolModel);
    }

}