<?php

namespace App\Interfaces;

interface IntentosLoginInterface extends BaseInterface
{
    /** Los intentos más recientes primero. */
    public function recientes(int $limite);
}
