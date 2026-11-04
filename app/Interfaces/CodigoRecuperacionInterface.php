<?php

namespace App\Interfaces;

/**
 * Dónde se guarda el código de recuperación de administrador (cifrado).
 * No es una tabla: vive en un archivo del servidor para que siga sirviendo
 * aunque la base de datos se dañe.
 */
interface CodigoRecuperacionInterface
{
    /** Guarda el hash del código y quién lo generó. Reemplaza el anterior. */
    public function guardar(string $hash, string $generadoPor): array;

    /** ['hash' => …, 'generado_en' => …, 'generado_por' => …] o null si no hay código. */
    public function leer(): ?array;

    /** Borra el código (después de usarlo). */
    public function eliminar(): void;
}
