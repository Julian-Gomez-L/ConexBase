<?php

namespace App\Http\Requests\TrabajosTapiceros;


use Illuminate\Foundation\Http\FormRequest;


class UpdateTrabajosTapicerosRequest extends FormRequest
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
            'produccion_id' => ['sometimes', 'integer', 'exists:producciones,id'],
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
            'produccion_id.integer' => 'El ID de la producción debe ser un número entero.',
            'produccion_id.exists' => 'El ID de la producción no existe en la base de datos.',
            'usuario_id.integer' => 'El ID del usuario debe ser un número entero.',
            'usuario_id.exists' => 'El ID del usuario no existe en la base de datos.',
        ];
    }
}