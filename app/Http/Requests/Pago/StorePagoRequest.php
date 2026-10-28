<?php

namespace App\Http\Requests\Pago;

use Illuminate\Foundation\Http\FormRequest;

class StorePagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pedido_id' => ['required', 'exists:pedidos,id'],
            'usuario_id' => ['required', 'exists:usuarios,id'],
            'monto' => ['required', 'numeric', 'min:0'],
            'metodo' => ['required', 'string'],
            'fecha_pago' => ['required', 'date'],
            'comprobante' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'pedido_id.required' => 'El pedido es obligatorio.',
            'pedido_id.exists' => 'El pedido seleccionado no existe.',

            'usuario_id.required' => 'El usuario es obligatorio.',
            'usuario_id.exists' => 'El usuario seleccionado no existe.',

            'monto.required' => 'El monto es obligatorio.',
            'monto.numeric' => 'El monto debe ser un número.',
            'monto.min' => 'El monto no puede ser negativo.',

            'metodo.required' => 'El método de pago es obligatorio.',
            'metodo.string' => 'El método de pago debe ser una cadena de texto.',

            'fecha_pago.required' => 'La fecha de pago es obligatoria.',
            'fecha_pago.date' => 'La fecha de pago debe ser una fecha válida.',

            'comprobante.string' => 'El comprobante debe ser una cadena de texto.',
        ];
    }
}