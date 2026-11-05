<?php

namespace App\Http\Requests\Producto;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'       => ['sometimes', 'string', 'max:150'],
            'medida'       => ['nullable', 'string', 'max:50'],
            'descripcion'  => ['nullable', 'string'],
            'precio'       => ['sometimes', 'numeric', 'min:0'],
            'categoria_id' => ['sometimes', 'integer', 'exists:categorias,id'],
            'estado'       => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'nombre.max' => 'El nombre no puede tener más de 150 caracteres.',
            'medida.max' => 'La medida no puede tener más de 50 caracteres.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'precio.numeric' => 'El precio debe ser un valor numérico.',
            'precio.min' => 'El precio no puede ser negativo.',
            'categoria_id.integer' => 'El ID de la categoría debe ser un número entero.',
            'categoria_id.exists' => 'La categoría no existe en la base de datos.',
        ];
    }
}