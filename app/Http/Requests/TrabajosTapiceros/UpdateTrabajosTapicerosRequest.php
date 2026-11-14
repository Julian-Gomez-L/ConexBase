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
            'cantidad' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'valor' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:9999999999'],
            'observacion_valor' => ['sometimes', 'nullable', 'string', 'max:255'],
            'revisado' => ['sometimes', 'boolean'],
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
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'cantidad.min' => 'La cantidad debe ser de al menos 1 unidad.',
            'valor.numeric' => 'El valor debe ser un número.',
            'valor.min' => 'El valor no puede ser negativo.',
            'valor.max' => 'El valor es demasiado alto.',
            'observacion_valor.max' => 'La observación no puede tener más de 255 caracteres.',
            'revisado.boolean' => 'Revisado debe ser verdadero o falso.',
        ];
    }
}