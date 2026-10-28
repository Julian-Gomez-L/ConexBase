<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistorialPedidos extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'historial_pedidos';

    protected $fillable = [
        'id',
        'fecha',
        'estado_anterior',
        'estado_nuevo',
        'observacion',
        'cliente_id',
        'usuario_id',
        'pedido_id',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'id_pedido');
    }
}