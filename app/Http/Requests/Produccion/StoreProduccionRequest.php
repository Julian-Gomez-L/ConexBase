<?php

namespace App\Http\Requests\Produccion;


use Illuminate\Foundation\Http\FormRequest;

class StoreProduccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'estado' => ['required', 'string'],
            'observaciones' => ['nullable', 'string'],
            'pedido_id' => ['required', 'integer', 'exists:pedidos,id'],
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',
            'fecha_fin.date' => 'La fecha de fin debe ser una fecha válida.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.string' => 'El estado debe ser una cadena de texto.',
            'observaciones.string' => 'Las observaciones deben ser una cadena de texto.',
            'pedido_id.required' => 'El ID del pedido es obligatorio.',
            'pedido_id.integer' => 'El ID del pedido debe ser un número entero.',
            'pedido_id.exists' => 'El ID del pedido no existe en la base de datos.',
            'producto_id.required' => 'El ID del producto es obligatorio.',
            'producto_id.integer' => 'El ID del producto debe ser un número entero.',
            'producto_id.exists' => 'El ID del producto no existe en la base de datos.',
            'usuario_id.required' => 'El ID del usuario es obligatorio.',
            'usuario_id.integer' => 'El ID del usuario debe ser un número entero.',
            'usuario_id.exists' => 'El ID del usuario no existe en la base de datos.',
        ];
    }
}