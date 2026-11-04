<?php

namespace App\Services;

use App\Exceptions\ApiAuthException;
use App\Interfaces\CodigoRecuperacionInterface;
use App\Interfaces\RolInterface;
use App\Interfaces\UsuarioInterface;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Código de recuperación de administrador.
 *
 * El Administrador genera un código y lo guarda impreso. Si un día no queda
 * ningún administrador activo (por ejemplo, alguien los desactivó o borró),
 * el dueño escribe ese código en "Recuperar acceso de administrador" y crea
 * (o reactiva) una cuenta de Administrador, sin depender de un desarrollador.
 *
 * Protecciones: solo funciona si NO hay ningún administrador activo, el código
 * es largo y de un solo uso, hay un máximo de intentos por hora (ruta) y cada
 * código equivocado queda en intentos_login.
 */
class RecuperacionAdminService
{
    /** Sin 0/O, 1/I/L para que no se confundan al copiarlo de un papel. */
    private const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    private const GRUPOS = 5;
    private const LETRAS_POR_GRUPO = 4;

    public const MOTIVO_CODIGO_INVALIDO = 'Código de recuperación inválido';

    public function __construct(
        private CodigoRecuperacionInterface $codigos,
        private UsuarioInterface $usuarios,
        private RolInterface $roles,
        private IntentosLoginService $intentos
    ) {
    }

    /** Si hay un código guardado, cuándo y quién lo generó (nunca el código). */
    public function estado(): array
    {
        $registro = $this->codigos->leer();

        return [
            'configurado' => $registro !== null,
            'generado_en' => $registro['generado_en'] ?? null,
            'generado_por' => $registro['generado_por'] ?? null,
        ];
    }

    /**
     * Genera un código nuevo (reemplaza el anterior). Es la ÚNICA vez que el
     * código se ve en claro: solo se guarda su hash.
     */
    public function generar(Usuario $administrador): array
    {
        $codigo = $this->codigoAleatorio();
        $registro = $this->codigos->guardar(
            Hash::make($this->normalizar($codigo)),
            trim("{$administrador->nombre} {$administrador->apellido}")
        );

        Log::info('Código de recuperación de administrador generado', ['por' => $registro['generado_por']]);

        return ['codigo' => $codigo, 'generado_en' => $registro['generado_en']];
    }

    /**
     * Crea (o reactiva) un Administrador con el código de recuperación.
     *
     * @param array $datos codigo, documento, nombre, apellido, correo, password
     */
    public function recuperar(array $datos, ?string $ip, ?string $navegador): Usuario
    {
        if ($this->usuarios->hayAdministradorActivo()) {
            throw ApiAuthException::recuperacionNoDisponible();
        }

        $registro = $this->codigos->leer();
        if ($registro === null) {
            throw ApiAuthException::sinCodigoRecuperacion();
        }

        if (!Hash::check($this->normalizar($datos['codigo']), $registro['hash'])) {
            $this->intentos->registrarFallido($datos['correo'], null, self::MOTIVO_CODIGO_INVALIDO, $ip, $navegador);
            throw ApiAuthException::codigoRecuperacionInvalido();
        }

        $administrador = DB::transaction(function () use ($datos) {
            $rol = $this->roles->asegurarAdministrador();
            $existente = $this->usuarios->buscarPorCorreoConEliminados($datos['correo']);

            // El correo ya era de alguien (por ejemplo, el dueño desactivado): se reactiva.
            if ($existente) {
                return $this->usuarios->activarComoAdministrador($existente, $rol->id, $datos['password']);
            }

            if ($this->usuarios->existeDocumento($datos['documento'])) {
                throw ValidationException::withMessages([
                    'documento' => 'Ya existe un usuario con ese documento. Escribe el correo de ese usuario para reactivarlo.',
                ]);
            }

            return $this->usuarios->create([
                'documento' => $datos['documento'],
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'correo' => $datos['correo'],
                'password' => $datos['password'],
                'rol_id' => $rol->id,
                'estado' => true,
            ]);
        });

        // Un solo uso: el Administrador debe generar uno nuevo.
        $this->codigos->eliminar();

        Log::warning('Acceso de administrador recuperado con el código de recuperación', [
            'correo' => $administrador->correo,
            'ip' => $ip,
        ]);

        return $administrador;
    }

    /** Ignora mayúsculas, espacios y guiones: "k7qm 2xrp…" = "K7QM-2XRP-…". */
    private function normalizar(string $codigo): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $codigo));
    }

    /** Ej.: K7QM-2XRP-9TWD-H4NB-6CVJ (20 caracteres aleatorios). */
    private function codigoAleatorio(): string
    {
        $grupos = [];
        for ($g = 0; $g < self::GRUPOS; $g++) {
            $grupo = '';
            for ($i = 0; $i < self::LETRAS_POR_GRUPO; $i++) {
                $grupo .= self::ALFABETO[random_int(0, strlen(self::ALFABETO) - 1)];
            }
            $grupos[] = $grupo;
        }

        return implode('-', $grupos);
    }
}
