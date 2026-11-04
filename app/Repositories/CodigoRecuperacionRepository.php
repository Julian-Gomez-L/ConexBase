<?php

namespace App\Repositories;

use App\Interfaces\CodigoRecuperacionInterface;
use Illuminate\Support\Facades\Storage;

/**
 * Guarda el código de recuperación en storage/app/private/seguridad/ (disco
 * "local" de Laravel). Esa carpeta no se sube al repositorio y no está en
 * MySQL, así que sobrevive si alguien daña la base de datos.
 */
class CodigoRecuperacionRepository implements CodigoRecuperacionInterface
{
    private const ARCHIVO = 'seguridad/codigo-recuperacion-admin.json';

    public function guardar(string $hash, string $generadoPor): array
    {
        $registro = [
            'hash' => $hash,
            'generado_en' => now()->format('Y-m-d H:i:s'),
            'generado_por' => $generadoPor,
        ];

        Storage::disk('local')->put(self::ARCHIVO, json_encode($registro, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $registro;
    }

    public function leer(): ?array
    {
        $disco = Storage::disk('local');
        if (!$disco->exists(self::ARCHIVO)) {
            return null;
        }

        $registro = json_decode((string) $disco->get(self::ARCHIVO), true);

        return is_array($registro) && !empty($registro['hash']) ? $registro : null;
    }

    public function eliminar(): void
    {
        Storage::disk('local')->delete(self::ARCHIVO);
    }
}
