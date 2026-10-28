<?php

namespace App\Repositories;

use App\Interfaces\CategoriasInterface;
use App\Models\Categoria;

class CategoriasRepository extends BaseRepository implements CategoriasInterface
{
    public function __construct(Categoria $categoriasModel)
    {
        parent::__construct($categoriasModel);
    }

}