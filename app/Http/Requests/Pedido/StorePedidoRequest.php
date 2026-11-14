<?php

namespace App\Http\Requests\Pedido;

use Illuminate\Foundation\Http\FormRequest;
use Ramsey\Uuid\Type\Integer;

class StorePedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['required','integer','exists:clientes,id'],
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'estado' => ['required', 'string'],
            'localidad' => ['required', 'string', 'max:150'],
            'total' => ['required', 'numeric', 'min:0'],
            // Recargo de Addi (10 %); ya está sumado en el total
            'recargo' => ['sometimes', 'numeric', 'min:0', 'lte:total'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.required' => 'El cliente es obligatorio.',
            'cliente_id.exists' => 'El cliente seleccionado no existe.',

            'usuario_id.required' => 'El usuario es obligatorio.',
            'usuario_id.exists' => 'El usuario seleccionado no existe.',

            'estado.required' => 'El estado es obligatorio.',
            'estado.string' => 'El estado debe ser una cadena de texto.',

            'localidad.required' => 'La localidad de entrega es obligatoria.',
            'localidad.max' => 'La localidad no puede tener más de 150 caracteres.',

            'total.required' => 'El total es obligatorio.',
            'total.numeric' => 'El total debe ser un número.',
            'total.min' => 'El total no puede ser negativo.',

            'recargo.numeric' => 'El recargo debe ser un número.',
            'recargo.min' => 'El recargo no puede ser negativo.',
            'recargo.lte' => 'El recargo no puede ser mayor que el total.',
        ];
    }
}