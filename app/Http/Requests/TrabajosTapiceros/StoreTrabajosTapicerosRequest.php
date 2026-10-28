<?php

namespace App\Http\Requests\TrabajosTapiceros;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrabajosTapicerosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descripcion' => ['required', 'string'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'estado' => ['required', 'string'],
            'observaciones' => ['nullable', 'string'],
            'produccion_id' => ['required', 'integer', 'exists:producciones,id'],
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser un texto.',

            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',

            'fecha_fin.date' => 'La fecha de fin debe ser una fecha válida.',

            'estado.required' => 'El estado es obligatorio.',
            'estado.string' => 'El estado debe ser una cadena de texto.',

            'observaciones.string' => 'Las observaciones deben ser una cadena de texto.',
            'usuario_id.required' => 'El ID del usuario es obligatorio.',
            'usuario_id.integer' => 'El ID del usuario debe ser un número entero.',
            'usuario_id.exists' => 'El ID del usuario no existe en la base de datos.',
            'produccion_id.required' => 'El ID de la producción es obligatorio.',
            'produccion_id.integer' => 'El ID de la producción debe ser un número entero.',
            'produccion_id.exists' => 'El ID de la producción no existe en la base de datos.',
        ];
    }
}
