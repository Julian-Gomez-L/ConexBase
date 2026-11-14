<?php

namespace App\Services;

use App\Exceptions\ApiAuthException;
use App\Interfaces\TrabajosTapicerosInterface;
use App\Models\Usuario;
use App\Support\Roles;
use Illuminate\Validation\ValidationException;

/**
 * Una producción de varias unidades (ej. 6 camas) se puede repartir entre
 * varios tapiceros (ej. 3 + 2 + 1). Regla: la suma de lo asignado no puede
 * pasar de las unidades del pedido.
 *
 * Pago y revisión (trabajos terminados):
 * - El tapicero solo actualiza SUS trabajos y solo estado, fechas y observaciones.
 * - `valor` y `observacion_valor` los ponen Producción o el Administrador.
 * - `revisado` (botón del gerente) solo lo marca el Administrador; un trabajo
 *   revisado ya no le deja cambiar el valor a Producción.
 */
class TrabajosTapicerosService extends BaseService
{
    public function __construct(TrabajosTapicerosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'TRABAJO';
    }

    protected function sustantivo(): string
    {
        return 'trabajo';
    }

    public function store(array $data)
    {
        $this->validarReparto((int) $data['produccion_id'], $data['cantidad'] ?? null);

        return parent::store($data);
    }

    public function update(array $data, $id)
    {
        if (array_key_exists('cantidad', $data) || array_key_exists('produccion_id', $data)) {
            $actual = $this->show($id);
            $this->validarReparto(
                (int) ($data['produccion_id'] ?? $actual->produccion_id),
                array_key_exists('cantidad', $data) ? $data['cantidad'] : $actual->cantidad,
                $actual->id
            );
        }

        return parent::update($data, $id);
    }

    /** update() con los permisos de quien hace el cambio (ver arriba). */
    public function actualizarComo(array $data, $id, ?Usuario $usuario)
    {
        $trabajo = $this->show($id);
        $rol = $usuario?->rol?->nombre;
        $esAdmin = in_array($rol, [Roles::ADMIN, Roles::SUPERADMIN], true);
        $esProduccion = $rol === Roles::PRODUCCION;
        $tocaPago = array_key_exists('valor', $data) || array_key_exists('observacion_valor', $data);

        if ($rol === Roles::TAPICERO) {
            $permitidos = ['estado', 'fecha_inicio', 'fecha_fin', 'observaciones'];
            if ((int) $trabajo->usuario_id !== (int) $usuario->id || array_diff(array_keys($data), $permitidos)) {
                throw ApiAuthException::accesoDenegado();
            }
        }

        if ($tocaPago && !$esAdmin && !($esProduccion && !$trabajo->revisado_en)) {
            throw new ApiAuthException(
                'TRABAJO_REVISADO',
                $esProduccion
                    ? 'Este trabajo ya fue revisado por el gerente: solo él puede cambiar el valor.'
                    : 'No tienes permisos para poner el valor del trabajo.',
                403
            );
        }

        if (array_key_exists('revisado', $data)) {
            if (!$esAdmin) {
                throw new ApiAuthException('SOLO_ADMIN_REVISA', 'Solo el gerente (administrador) puede marcar un trabajo como revisado.', 403);
            }
            if ($data['revisado'] && !str_starts_with(mb_strtolower((string) $trabajo->estado), 'finaliz')) {
                throw ValidationException::withMessages(['revisado' => ['Solo se revisan trabajos terminados.']]);
            }
            $data['revisado_en'] = $data['revisado'] ? now() : null;
            $data['revisado_por'] = $data['revisado'] ? $usuario->id : null;
            unset($data['revisado']);
        }

        return $this->update($data, $id);
    }

    private function validarReparto(int $produccionId, ?int $cantidad, ?int $exceptoTrabajoId = null): void
    {
        $total = $this->repository->unidadesDeLaProduccion($produccionId);
        $asignadas = $this->repository->unidadesAsignadas($produccionId, $exceptoTrabajoId);
        $disponibles = max(0, $total - $asignadas);
        $pedidas = $cantidad ?? $total;

        if ($pedidas > $disponibles) {
            $mensaje = $disponibles === 0
                ? 'Todas las unidades de esta producción ya están asignadas a tapiceros.'
                : "Solo quedan {$disponibles} de {$total} unidades por asignar en esta producción.";

            throw ValidationException::withMessages(['cantidad' => [$mensaje]]);
        }
    }
}
