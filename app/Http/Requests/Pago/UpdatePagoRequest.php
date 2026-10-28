<?php

namespace App\Http\Requests\Pago;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pedido_id' => ['sometimes', 'exists:pedidos,id'],
            'usuario_id' => ['sometimes', 'exists:usuarios,id'],
            'monto' => ['sometimes', 'numeric', 'min:0'],
            'metodo' => ['sometimes', 'string'],
            'fecha_pago' => ['sometimes', 'date'],
            'comprobante' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'pedido_id.exists' => 'El pedido seleccionado no existe.',

            'usuario_id.exists' => 'El usuario seleccionado no existe.',

            'monto.numeric' => 'El monto debe ser un número.',
            'monto.min' => 'El monto no puede ser negativo.',

            'metodo.string' => 'El método de pago debe ser una cadena de texto.',

            'fecha_pago.date' => 'La fecha de pago debe ser una fecha válida.',

            'comprobante.string' => 'El comprobante debe ser una cadena de texto.',
        ];
    }
}