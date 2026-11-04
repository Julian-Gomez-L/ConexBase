<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RecuperarAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo'    => ['required', 'string', 'max:40'],
            'documento' => ['required', 'string', 'max:20'],
            'nombre'    => ['required', 'string', 'max:100'],
            'apellido'  => ['required', 'string', 'max:100'],
            'correo'    => ['required', 'email', 'max:150'],
            'password'  => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required'    => 'Escribe el código de recuperación.',
            'documento.required' => 'El documento es obligatorio.',
            'nombre.required'    => 'El nombre es obligatorio.',
            'apellido.required'  => 'El apellido es obligatorio.',
            'correo.required'    => 'El correo es obligatorio.',
            'correo.email'       => 'El correo no tiene un formato válido.',
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }
}
