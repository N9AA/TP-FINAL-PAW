<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
            'guard_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del permiso es obligatorio.',
            'name.string' => 'El nombre del permiso debe ser un texto.',
            'name.max' => 'El nombre del permiso no puede superar los 255 caracteres.',
            'name.unique' => 'Ya existe un permiso con ese nombre.',
            'guard_name.string' => 'El guard debe ser un texto.',
            'guard_name.max' => 'El guard no puede superar los 255 caracteres.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre del permiso',
            'guard_name' => 'guard',
        ];
    }
}