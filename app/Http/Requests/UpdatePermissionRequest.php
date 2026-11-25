<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $permission = $this->route('permission');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:permissions,name,' . $permission->id,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del permiso es obligatorio.',
            'name.string' => 'El nombre del permiso debe ser un texto.',
            'name.max' => 'El nombre del permiso no puede superar los 255 caracteres.',
            'name.unique' => 'Ya existe un permiso con ese nombre.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre del permiso',
        ];
    }
}
