<?php

namespace App\Http\Requests\DetallePedido;

use Illuminate\Foundation\Http\FormRequest;

class StoreDetallePedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pedido_id' => ['required', 'integer','exists:pedidos,id'],
            // Sin catálogo: cada producto se describe con sus especificaciones.
            // producto_id solo lo traen los pedidos anteriores al cambio.
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'diseno' => ['required_without:producto_id', 'nullable', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'color_tela' => ['required_without:producto_id', 'nullable', 'string', 'max:100'],
            'tipo_tela' => ['required_without:producto_id', 'nullable', 'string', 'max:100'],
            'cantidad' => ['required', 'integer', 'min:1'],
            'precio_unitario' => ['required', 'numeric', 'min:0'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'pedido_id.required' => 'El pedido es obligatorio.',
            'pedido_id.exists' => 'El pedido seleccionado no existe.',

            'producto_id.exists' => 'El producto seleccionado no existe.',

            'diseno.required_without' => 'El diseño es obligatorio.',
            'diseno.max' => 'El diseño no puede tener más de 150 caracteres.',
            'descripcion.max' => 'La descripción no puede tener más de 2000 caracteres.',
            'color_tela.required_without' => 'El color de la tela es obligatorio.',
            'color_tela.max' => 'El color de la tela no puede tener más de 100 caracteres.',
            'tipo_tela.required_without' => 'El tipo de tela es obligatorio.',
            'tipo_tela.max' => 'El tipo de tela no puede tener más de 100 caracteres.',

            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'cantidad.min' => 'La cantidad debe ser mínimo 1.',

            'precio_unitario.required' => 'El precio unitario es obligatorio.',
            'precio_unitario.numeric' => 'El precio unitario debe ser un número.',
            'precio_unitario.min' => 'El precio unitario no puede ser negativo.',

            'subtotal.required' => 'El subtotal es obligatorio.',
            'subtotal.numeric' => 'El subtotal debe ser un número.',
            'subtotal.min' => 'El subtotal no puede ser negativo.',
        ];
    }
}