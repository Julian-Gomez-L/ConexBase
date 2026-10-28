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
            'documento' => ['required', 'string', 'max:20', 'unique:usuarios,documento'],
            'nombre'    => ['required', 'string', 'max:100'],
            'apellido'  => ['required', 'string', 'max:100'],
            'correo'    => ['required', 'email', 'max:150', 'unique:usuarios,correo'],
            'password'  => ['required', 'string', 'min:8'],
            'rol_id'    => ['required', 'integer', 'exists:roles,id'],
            'estado'    => ['sometimes', 'boolean'],
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
            'documento.required' => 'El documento es obligatorio.',
            'documento.unique'   => 'Ya existe un usuario con ese documento.',
            'documento.max'      => 'El documento no puede tener más de 20 caracteres.',
            'apellido.required'  => 'El apellido es obligatorio.',
            'estado.boolean'     => 'El estado debe ser activo o inactivo.',
            'rol_id.exists'     => 'El rol seleccionado no es válido.',
        ];
    }
}