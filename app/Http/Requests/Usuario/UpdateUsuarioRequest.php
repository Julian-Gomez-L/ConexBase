<?php

namespace App\Http\Requests\Usuario;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'   => ['required', 'string', 'max:100'],
            'correo'    => ['required', 'email'],
            'password' => ['nullable', 'string', 'min:8'], // Es nullable para que no sea obligatorio cambiarla
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
            'password.min'      => 'La contraseña debe tener al menos 8 caracteres.',
            'rol_id.required'   => 'Debe asignar un rol al usuario.',
            'rol_id.exists'     => 'El rol seleccionado no es válido.',
        ];
    }
}