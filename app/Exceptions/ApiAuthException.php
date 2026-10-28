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
}
