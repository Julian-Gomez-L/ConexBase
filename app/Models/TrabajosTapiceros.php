<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrabajosTapiceros extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'trabajos_tapiceros';

    protected $fillable = [
        'id',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'observaciones',
        'descripcion',
        'produccion_id',
        'usuario_id',
    ];

    public function produccion()
    {
        return $this->belongsTo(Produccion::class, 'produccion_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}