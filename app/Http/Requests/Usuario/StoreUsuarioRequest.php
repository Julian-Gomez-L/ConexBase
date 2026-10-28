<?php

namespace App\Http\Requests\Usuario;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Ajusta estos campos según tu migración de usuarios
            'nombre'   => ['required', 'string', 'max:100'],
            'correo'    => ['required', 'email', 'unique:usuarios,email'],
            'password' => ['required', 'string', 'min:8'],
            'rol_id'   => ['required', 'integer', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'   => 'El nombre del usuario es obligatorio.',
            'nombre.string'     => 'El nombre debe ser texto.',
            'correo.required'    => 'El correo electrónico es obligatorio.',
            'correo.email'       => 'Debe ingresar un correo válido.',
            'correo.unique'      => 'Este correo ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min'      => 'La contraseña debe tener al menos 8 caracteres.',
            'rol_id.required'   => 'Debe asignar un rol al usuario.',
            'rol_id.exists'     => 'El rol seleccionado no es válido.',
        ];
    }
}