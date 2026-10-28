<?php

namespace App\Http\Requests\Produccion;


use Illuminate\Foundation\Http\FormRequest;


class UpdateProduccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_inicio' => ['sometimes', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'estado' => ['sometimes', 'string'],
            'observaciones' => ['nullable', 'string'],
            'pedido_id' => ['sometimes', 'integer', 'exists:pedidos,id'],
            'producto_id' => ['sometimes', 'integer', 'exists:productos,id'],
            'usuario_id' => ['sometimes', 'integer', 'exists:usuarios,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',
            'fecha_fin.date' => 'La fecha de fin debe ser una fecha válida.',
            'estado.string' => 'El estado debe ser una cadena de texto.',
            'observaciones.string' => 'Las observaciones deben ser una cadena de texto.',
            'pedido_id.integer' => 'El ID del pedido debe ser un número entero.',
            'pedido_id.exists' => 'El ID del pedido no existe en la base de datos.',
            'producto_id.integer' => 'El ID del producto debe ser un número entero.',
            'producto_id.exists' => 'El ID del producto no existe en la base de datos.',
            'usuario_id.integer' => 'El ID del usuario debe ser un número entero.',
            'usuario_id.exists' => 'El ID del usuario no existe en la base de datos.',
        ];
    }
}