<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pago extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $table = 'pagos';

    protected $fillable = [
        'pedido_id',
        'usuario_id',
        'monto',
        'metodo',
        'fecha_pago',
        'comprobante'
    ];

    public function cliente()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}