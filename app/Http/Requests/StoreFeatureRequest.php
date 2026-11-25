<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $option = $this->route('option');

        return [
            'value' => [
                'required',
                'string',
                'max:255',
                $option->type == 2
                    ? 'regex:/^#[a-f0-9]{6}$/i'
                    : 'string',
            ],

            'description' => [
                'required',
                'string',
                'max:255',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'value' => 'valor',
            'description' => 'descripción',
        ];
    }
}