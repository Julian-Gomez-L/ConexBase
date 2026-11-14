<?php

namespace App\Services;

use App\Exceptions\ApiAuthException;
use App\Interfaces\PedidosInterface;
use App\Models\Usuario;
use App\Support\Roles;

class PedidosService extends BaseService
{
    /** Estado que confirma la entrega (y le da la comisión al asesor). */
    public const ENTREGADO = 'Entregado';

    public function __construct(PedidosInterface $repository)
    {
        parent::__construct($repository);
    }

    protected function codigo(): string
    {
        return 'PEDIDO';
    }

    protected function sustantivo(): string
    {
        return 'pedido';
    }

    /**
     * Igual que update(), pero solo el Administrador (o el Super Administrador)
     * puede marcar un pedido como Entregado o quitarle ese estado: de eso
     * depende la comisión del asesor. Se hace en Pedidos del Día.
     */
    public function actualizarComo(array $data, $id, ?Usuario $usuario)
    {
        if (array_key_exists('estado', $data)) {
            $actual = $this->show($id);
            $tocaEntrega = $data['estado'] === self::ENTREGADO || $actual->estado === self::ENTREGADO;
            $esAdmin = in_array($usuario?->rol?->nombre, [Roles::ADMIN, Roles::SUPERADMIN], true);

            if ($tocaEntrega && $data['estado'] !== $actual->estado && !$esAdmin) {
                throw new ApiAuthException(
                    'SOLO_ADMIN_ENTREGA',
                    'Solo el administrador puede confirmar si un pedido se entregó.',
                    403
                );
            }
        }

        return $this->update($data, $id);
    }
}
