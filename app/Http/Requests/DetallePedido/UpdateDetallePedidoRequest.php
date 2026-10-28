<?php

namespace App\Http\Requests\DetallePedido;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDetallePedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pedido_id' => ['sometimes', 'exists:pedidos,id'],
            'producto_id' => ['sometimes', 'exists:productos,id'],
            'cantidad' => ['sometimes', 'integer', 'min:1'],
            'precio_unitario' => ['sometimes', 'numeric', 'min:0'],
            'subtotal' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'pedido_id.exists' => 'El pedido seleccionado no existe.',
            'producto_id.exists' => 'El producto seleccionado no existe.',

            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'cantidad.min' => 'La cantidad debe ser mínimo 1.',

            'precio_unitario.numeric' => 'El precio unitario debe ser un número.',
            'precio_unitario.min' => 'El precio unitario no puede ser negativo.',

            'subtotal.numeric' => 'El subtotal debe ser un número.',
            'subtotal.min' => 'El subtotal no puede ser negativo.',
        ];
    }
}