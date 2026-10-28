<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'documento',
        'nombre',
        'apellido',
        'correo',
        'password',
        'rol_id',
        'estado'
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * 'hashed': Laravel hashea con bcrypt la contraseña cada vez que se asigna
     * (crear o actualizar). Si ya viene hasheada (p. ej. desde el seeder), no la vuelve a hashear.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // En belongsTo sí es buena idea dejar el ID explícito por seguridad
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

}