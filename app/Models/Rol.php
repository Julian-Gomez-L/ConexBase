<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rol extends Model
{
    use HasFactory; // se encarga de crear datos de prueba
    use SoftDeletes;

    protected $table="roles"; // escribimos como se llama la tabla en la DB

    protected $fillable =[ // definimos los campos
        'nombre',
        'descripcion',
        'estado', //1, 0
    ];

    protected $casts =[
        'estado' => 'boolean' 
    ];

    public function usuario()
    {
        return $this->hasMany(Usuario::class);
    }

}