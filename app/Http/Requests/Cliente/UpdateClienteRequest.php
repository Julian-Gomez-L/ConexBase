<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'documento' => ['sometimes', 'string', 'max:20', 'unique:clientes,documento,' . $this->route('cliente')],
            'nombre'    => ['sometimes', 'string', 'max:150'],
            'telefono'  => ['sometimes', 'string', 'max:20'],
            'correo'    => ['sometimes', 'email', 'max:150', 'unique:clientes,correo,' . $this->route('cliente')],
            'direccion' => ['nullable', 'string', 'max:255'],
            'estado'    => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'apellido.string' => 'El apellido debe ser una cadena de texto.',
            'documento.unique' => 'Ya existe un cliente registrado con ese documento.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'correo.email' => 'El correo electrónico debe tener un formato válido.',
            'correo.unique' => 'Ya existe un cliente registrado con ese correo.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
            'direccion.string' => 'La dirección debe ser una cadena de texto.',
        ];
    }
}