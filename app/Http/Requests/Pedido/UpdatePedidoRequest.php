<?php

namespace App\Http\Requests\Pedido;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['sometimes', 'exists:clientes,id'],
            'usuario_id' => ['sometimes', 'exists:usuarios,id'],
            'estado' => ['sometimes', 'string'],
            'total' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.exists' => 'El cliente seleccionado no existe.',

            'usuario_id.exists' => 'El usuario seleccionado no existe.',

            'estado.string' => 'El estado debe ser una cadena de texto.',

            'total.numeric' => 'El total debe ser un número.',
            'total.min' => 'El total no puede ser negativo.',
        ];
    }
}