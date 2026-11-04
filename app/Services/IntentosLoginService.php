<?php

namespace App\Services;

use App\Interfaces\IntentosLoginInterface;
use App\Models\Usuario;

class IntentosLoginService extends BaseService
{
    /** Cuántos intentos devuelve el listado (los más recientes). */
    public const LIMITE_LISTADO = 500;

    public function __construct(IntentosLoginInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'INTENTO_LOGIN';
    }

    protected function sustantivo(): string
    {
        return 'intento de inicio de sesión';
    }

    public function list()
    {
        return $this->repository->recientes(self::LIMITE_LISTADO);
    }

    /**
     * Guarda un intento fallido. El nombre y el rol se copian del usuario dueño
     * del correo (si existe) tal como están en este momento.
     */
    public function registrarFallido(string $correo, ?Usuario $usuario, string $motivo, ?string $ip, ?string $navegador): void
    {
        $this->repository->create([
            'correo' => mb_substr($correo, 0, 150),
            'usuario_id' => $usuario?->id,
            'nombre' => $usuario ? trim("{$usuario->nombre} {$usuario->apellido}") : null,
            'rol' => $usuario?->rol?->nombre,
            'motivo' => $motivo,
            'ip' => $ip,
            'navegador' => $navegador !== null ? mb_substr($navegador, 0, 255) : null,
            'fecha' => now(),
        ]);
    }
}
