<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Un intento de inicio de sesión fallido. Es un registro de auditoría: no se
 * edita ni se elimina desde la API (por eso no usa SoftDeletes).
 */
class IntentoLogin extends Model
{
    public const CONTRASENA_INCORRECTA = 'Contraseña incorrecta';
    public const CORREO_NO_EXISTE = 'El correo no existe';
    public const USUARIO_INACTIVO = 'Usuario inactivo';

    protected $table = 'intentos_login';

    protected $fillable = [
        'correo',
        'usuario_id',
        'nombre',
        'rol',
        'motivo',
        'ip',
        'navegador',
        'fecha',
    ];

    protected $casts = [
        // En el JSON sale como "2026-11-03 19:35:12" (hora de Colombia)
        'fecha' => 'datetime:Y-m-d H:i:s',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
