<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name)
                ? trim($this->name)
                : $this->name,
        ]);
    }

    public function rules(): array
    {
        return [
            'family_id' => [
                'required',
                'integer',
                'exists:families,id',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->where('family_id', $this->input('family_id'))
                    ->ignore($this->route('category')),
            ],
            'estado' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'family_id.required' => 'Debes seleccionar una familia.',
            'family_id.integer' => 'La familia seleccionada no es válida.',
            'family_id.exists' => 'La familia seleccionada no existe.',

            'name.required' => 'El nombre de la categoría es obligatorio.',
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede superar los 255 caracteres.',
            'name.unique' => 'Ya existe otra categoría con ese nombre en esta familia.',

            'estado.required' => 'Debes indicar el estado de la categoría.',
            'estado.boolean' => 'El estado debe ser activo o inactivo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'family_id' => 'familia',
            'name' => 'nombre',
            'estado' => 'estado',
        ];
    }
}
