<?php

namespace App\Http\Requests\Rol;

use Illuminate\Foundation\Http\FormRequest;

class StoreRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Ajusta "nombre" por el campo real de tu tabla roles
            'nombre' => ['required', 'string', 'max:50', 'unique:roles,nombre'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del rol es obligatorio.',
            'nombre.string'   => 'El nombre debe ser una cadena de texto.',
            'nombre.max'      => 'El nombre no puede superar los 50 caracteres.',
            'nombre.unique'   => 'Este rol ya existe en la base de datos.',
        ];
    }
}