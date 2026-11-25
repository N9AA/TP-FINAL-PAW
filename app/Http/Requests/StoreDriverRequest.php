<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'type' => ['required', 'integer', 'in:1,2'],
            'plate_number' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Debes seleccionar un usuario.',
            'user_id.exists' => 'El usuario seleccionado no existe.',
            'type.required' => 'Debes seleccionar un tipo de conductor.',
            'type.integer' => 'El tipo de conductor no es válido.',
            'type.in' => 'El tipo de conductor seleccionado no es válido.',
            'plate_number.string' => 'La patente debe ser un texto válido.',
            'plate_number.max' => 'La patente no puede superar los 255 caracteres.',
        ];
    }

    public function attributes(): array
    {
        return [
            'user_id' => 'usuario',
            'type' => 'tipo de conductor',
            'plate_number' => 'patente',
        ];
    }
}