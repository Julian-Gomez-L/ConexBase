<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'documento' => ['required', 'string', 'max:20', 'unique:clientes,documento'],
            'nombre'    => ['required', 'string', 'max:150'],
            'telefono'  => ['required', 'string', 'max:20'],
            'correo'    => ['required', 'email', 'max:150', 'unique:clientes,correo'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'estado'    => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'apellido.required' => 'El apellido es obligatorio.',
            'apellido.string' => 'El apellido debe ser una cadena de texto.',
            'documento.required' => 'El documento es obligatorio.',
            'documento.unique' => 'Ya existe un cliente registrado con ese documento.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'correo.email' => 'El correo electrónico debe tener un formato válido.',
            'correo.unique' => 'Ya existe un cliente registrado con ese correo.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
            'direccion.string' => 'La dirección debe ser una cadena de texto.',
        ];
    }
}