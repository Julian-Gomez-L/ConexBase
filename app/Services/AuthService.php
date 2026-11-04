<?php

namespace App\Services;

use App\Exceptions\ApiAuthException;
use App\Interfaces\TokenAccesoInterface;
use App\Interfaces\UsuarioInterface;
use App\Models\IntentoLogin;
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
        private TokenAccesoInterface $tokens,
        private IntentosLoginService $intentos
    ) {
    }

    /**
     * @param string|null $ip        IP de quien intenta entrar (para el registro de intentos fallidos)
     * @param string|null $navegador User-Agent del navegador (ídem)
     */
    public function login(string $correo, string $password, ?string $ip = null, ?string $navegador = null): array
    {
        $correo = trim($correo);
        $usuario = $this->usuarios->buscarPorCorreo($correo);

        $coincide = Hash::check($password, $usuario?->password ?? self::HASH_RELLENO);

        $motivo = match (true) {
            !$usuario => IntentoLogin::CORREO_NO_EXISTE,
            !$coincide => IntentoLogin::CONTRASENA_INCORRECTA,
            !$usuario->estado => IntentoLogin::USUARIO_INACTIVO,
            default => null,
        };

        if ($motivo !== null) {
            // Queda registrado para el Administrador; al usuario se le responde
            // con el mismo mensaje genérico de siempre (no revela el motivo).
            try {
                $this->intentos->registrarFallido($correo, $usuario, $motivo, $ip, $navegador);
            } catch (\Throwable $e) {
                report($e); // si el registro falla, el login igual responde normal
            }

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
