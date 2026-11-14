<?php

namespace App\Interfaces;

interface TrabajosTapicerosInterface extends BaseInterface
{
    /** Unidades del producto en el pedido de esa producción (detalle_pedidos.cantidad). */
    public function unidadesDeLaProduccion(int $produccionId): int;

    /**
     * Unidades ya repartidas entre tapiceros en esa producción. Un trabajo con
     * `cantidad` NULL (registros anteriores al reparto) cuenta como todas.
     *
     * @param int|null $exceptoTrabajoId trabajo que no se cuenta (al editarlo)
     */
    public function unidadesAsignadas(int $produccionId, ?int $exceptoTrabajoId = null): int;
}
