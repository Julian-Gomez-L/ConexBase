<?php

namespace App\Repositories;

use App\Interfaces\ClientesInterface;
use App\Models\Cliente;

class ClientesRepository extends BaseRepository implements ClientesInterface
{
    public function __construct(Cliente $clientesModel)
    {
        parent::__construct($clientesModel);
    }

}
