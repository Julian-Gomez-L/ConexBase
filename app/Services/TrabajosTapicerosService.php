<?php

namespace App\Services;

use App\Interfaces\TrabajosTapicerosInterface;
use Illuminate\Validation\ValidationException;

/**
 * Una producción de varias unidades (ej. 6 camas) se puede repartir entre
 * varios tapiceros (ej. 3 + 2 + 1). Regla: la suma de lo asignado no puede
 * pasar de las unidades del pedido.
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
