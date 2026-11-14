<?php

namespace App\Repositories;

use App\Interfaces\TrabajosTapicerosInterface;
use App\Models\DetallePedido;
use App\Models\Produccion;
use App\Models\TrabajosTapiceros;

class TrabajosTapicerosRepository extends BaseRepository implements TrabajosTapicerosInterface
{
    public function __construct(TrabajosTapiceros $trabajosTapicerosModel)
    {
        parent::__construct($trabajosTapicerosModel);
    }

    public function unidadesDeLaProduccion(int $produccionId): int
    {
        $produccion = Produccion::find($produccionId);
        if (!$produccion) {
            return 0;
        }

        // Producciones nuevas: ligadas al detalle. Las viejas: por producto del catálogo.
        $cantidad = $produccion->detalle_pedido_id
            ? DetallePedido::whereKey($produccion->detalle_pedido_id)->value('cantidad')
            : DetallePedido::where('pedido_id', $produccion->pedido_id)
                ->where('producto_id', $produccion->producto_id)
                ->sum('cantidad');

        return max(1, (int) $cantidad);
    }

    public function unidadesAsignadas(int $produccionId, ?int $exceptoTrabajoId = null): int
    {
        $total = $this->unidadesDeLaProduccion($produccionId);

        return (int) $this->model
            ->where('produccion_id', $produccionId)
            ->when($exceptoTrabajoId, fn ($q) => $q->where('id', '!=', $exceptoTrabajoId))
            ->get(['cantidad'])
            ->sum(fn ($t) => $t->cantidad ?? $total);
    }
}
