<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;    
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pedido extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'pedidos';

    protected $fillable = [
        'cliente_id',
        'usuario_id',
        'metodo_pago',
        'estado',
        'total',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }   
    public function detallePedidos()
    {
        return $this->hasMany(DetallePedido::class);
    }
     public function pagos ()
    {
        return $this->hasMany(Pago::class);
    }

    public function producciones  ()
    {
        return $this->hasMany(Produccion ::class);
    }

    public function historialPedidos ()
    {
        return $this->hasMany(HistorialPedidos::class);
    }

}