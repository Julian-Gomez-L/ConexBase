<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenAcceso extends Model
{
    protected $table = 'tokens_acceso';

    protected $fillable = [
        'usuario_id',
        'token',
        'expira_en',
        'ultimo_uso_en',
    ];

    protected $hidden = [
        'token',
    ];

    protected $casts = [
        'expira_en' => 'datetime',
        'ultimo_uso_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
