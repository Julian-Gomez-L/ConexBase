<?php

namespace App\Exceptions;

use Exception;

/**
 * Errores de autenticación/autorización (401, 403).
 * Se transforma en JSON en bootstrap/app.php con el mismo formato de las demás excepciones.
 */
class ApiAuthException extends Exception
{
    public function __construct(
        public string $errorCode,
        string $message,
        public int $status
    ) {
        parent::__construct($message);
    }

    public static function credencialesInvalidas(): self
    {
        // Mensaje genérico a propósito: no revela si el correo existe.
        return new self('INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.', 401);
    }

    public static function noAutenticado(): self
    {
        return new self('UNAUTHENTICATED', 'Debes iniciar sesión para continuar.', 401);
    }

    public static function accesoDenegado(): self
    {
        return new self('FORBIDDEN', 'No tienes permisos para realizar esta acción.', 403);
    }

    /** Recuperación: solo sirve si no queda ningún Super Administrador activo. */
    public static function recuperacionNoDisponible(): self
    {
        return new self(
            'RECUPERACION_NO_DISPONIBLE',
            'La recuperación no está disponible: todavía hay un Super Administrador activo. Pídele que te dé acceso.',
            409
        );
    }

    public static function sinCodigoRecuperacion(): self
    {
        return new self(
            'SIN_CODIGO_RECUPERACION',
            'No hay un código de recuperación configurado. Contacta al equipo de desarrollo.',
            409
        );
    }

    public static function codigoRecuperacionInvalido(): self
    {
        // 422 y no 401: un 401 haría que el frontend cierre sesión y redirija al login
        return new self('CODIGO_RECUPERACION_INVALIDO', 'El código de recuperación no es válido.', 422);
    }
}
