<?php

namespace App\Services;

use App\Exceptions\ApiAuthException;
use App\Interfaces\TokenAccesoInterface;
use App\Interfaces\UsuarioInterface;
use App\Models\TokenAcceso;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    private const HORAS_VIGENCIA = 8;

    /**
     * Hash bcrypt de relleno: se compara aunque el correo no exista para que
     * la respuesta tarde lo mismo y no se pueda averiguar qué correos están registrados.
     */
    private const HASH_RELLENO = '$2y$12$S0bZAdL6bP1Gp5I0VVd7u.jZjGJk5RVWfViGuK4nQQ5/MidbHj/Tq';

    public function __construct(
        private UsuarioInterface $usuarios,
        private TokenAccesoInterface $tokens
    ) {
    }

    public function login(string $correo, string $password): array
    {
        $usuario = $this->usuarios->buscarPorCorreo(trim($correo));

        $coincide = Hash::check($password, $usuario?->password ?? self::HASH_RELLENO);

        if (!$usuario || !$coincide || !$usuario->estado) {
            throw ApiAuthException::credencialesInvalidas();
        }

        $this->tokens->eliminarExpirados($usuario->id);

        // El valor en claro solo viaja al cliente; en la BD queda su hash sha256.
        $tokenPlano = Str::random(64);
        $expiraEn = now()->addHours(self::HORAS_VIGENCIA);

        $this->tokens->crear([
            'usuario_id' => $usuario->id,
            'token' => hash('sha256', $tokenPlano),
            'expira_en' => $expiraEn,
        ]);

        return [
            'token' => $tokenPlano,
            'tipo' => 'Bearer',
            'expira_en' => $expiraEn->toIso8601String(),
            'usuario' => $this->datosPublicos($usuario),
        ];
    }

    public function logout(TokenAcceso $token): void
    {
        $this->tokens->revocar($token);
    }

    public function datosPublicos(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre,
            'apellido' => $usuario->apellido,
            'correo' => $usuario->correo,
            'rol' => [
                'id' => $usuario->rol?->id,
                'nombre' => $usuario->rol?->nombre,
            ],
        ];
    }
}
