<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del rol es obligatorio.',
            'name.string' => 'El nombre del rol debe ser un texto.',
            'name.max' => 'El nombre del rol no puede superar los 255 caracteres.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
            'permissions.array' => 'Los permisos seleccionados no son válidos.',
            'permissions.*.exists' => 'Uno de los permisos seleccionados no existe.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre del rol',
            'permissions' => 'permisos',
        ];
    }
}