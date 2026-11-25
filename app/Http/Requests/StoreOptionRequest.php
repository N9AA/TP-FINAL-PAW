<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:1,2'],
            'features' => ['required', 'array', 'min:1'],

            'features.*.value' => [
                'required',
                'string',
                'max:255',
                $this->input('type') == 2
                    ? 'regex:/^#[a-f0-9]{6}$/i'
                    : 'string',
            ],

            'features.*.description' => [
                'required',
                'string',
                'max:255',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'type' => 'tipo',
            'features' => 'valores',
            'features.*.value' => 'valor',
            'features.*.description' => 'descripción',
        ];
    }
}