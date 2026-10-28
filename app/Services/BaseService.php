<?php

namespace App\Services;

use App\Exceptions\InvalidIdException;
use App\Exceptions\ResourceNotFoundException;
use App\Interfaces\BaseInterface;

/**
 * CRUD común a todas las entidades (mismo patrón que BaseRepository).
 *
 * Cada service hijo solo define cómo se llama su entidad, para los mensajes
 * de error, y agrega su propia lógica de negocio. Para cambiar un caso
 * concreto, sobrescribe el método y llama a parent:: (ver UsuarioService).
 */
abstract class BaseService
{
    public function __construct(protected BaseInterface $repository)
    {
    }

    /** Prefijo del código de error: 'PEDIDO' → 'PEDIDO_NOT_FOUND'. */
    abstract protected function codigo(): string;

    /** Nombre de la entidad en minúscula: 'pedido', 'categoría'. */
    abstract protected function sustantivo(): string;

    /** true si la entidad es femenina ('la categoría … eliminada'). */
    protected function femenino(): bool
    {
        return false;
    }

    public function list()
    {
        return $this->repository->getAll();
    }

    public function store(array $data)
    {
        return $this->repository->create($data);
    }

    public function show($id)
    {
        $registro = $this->repository->getById($this->validarId($id));

        if (!$registro) {
            $this->noExiste();
        }
        return $registro;
    }

    public function update(array $data, $id)
    {
        $resultado = $this->repository->update($data, $this->validarId($id));

        if (!$resultado) {
            $this->noExiste('actualizad');
        }
        return $resultado;
    }

    public function destroy($id)
    {
        $resultado = $this->repository->delete($this->validarId($id));

        if (!$resultado) {
            $this->noExiste('eliminad');
        }
        return $resultado;
    }

    /** Acepta solo enteros positivos (1, '25'); rechaza 'abc', '-5', '1.5', ' 1'. */
    protected function validarId($id): int
    {
        $esEnteroPositivo = is_int($id)
            ? $id > 0
            : is_string($id) && ctype_digit($id) && (int) $id > 0;

        if (!$esEnteroPositivo) {
            $de = $this->femenino() ? 'de la' : 'del';
            throw new InvalidIdException(
                'INVALID_ID',
                "El identificador {$de} {$this->sustantivo()} no es válido."
            );
        }
        return (int) $id;
    }

    /**
     * Lanza el 404 con el mismo mensaje que usaba cada service:
     *   'El pedido no existe.' / 'La categoría no existe y no puede ser eliminada.'
     */
    protected function noExiste(?string $accion = null): never
    {
        $articulo = $this->femenino() ? 'La' : 'El';
        $mensaje = "{$articulo} {$this->sustantivo()} no existe";

        if ($accion) {
            $mensaje .= ' y no puede ser ' . $accion . ($this->femenino() ? 'a' : 'o');
        }

        throw new ResourceNotFoundException("{$this->codigo()}_NOT_FOUND", $mensaje . '.');
    }
}
