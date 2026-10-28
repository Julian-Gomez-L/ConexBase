<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produccion extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'producciones';

    protected $fillable = [
        'id',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'observaciones',
        'pedido_id',
        'producto_id',
        'usuario_id',
    ];

        public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}