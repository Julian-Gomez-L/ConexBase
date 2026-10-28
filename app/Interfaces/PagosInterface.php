<?php

namespace App\Interfaces;

interface PagosInterface extends BaseInterface
{
    public function getAllWithTrashed();
}
