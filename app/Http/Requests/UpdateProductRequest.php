<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sku' => is_string($this->sku) ? trim($this->sku) : $this->sku,
            'name' => is_string($this->name) ? trim($this->name) : $this->name,
        ]);
    }

    public function rules(): array
    {
        return [
            'image' => [
                'nullable',
                'image',
                'max:5120',
            ],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($this->route('product')),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'subcategory_id' => [
                'required',
                'exists:subcategories,id',
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
            'image.image' => 'El archivo seleccionado debe ser una imagen.',
            'image.max' => 'La imagen no puede superar 5 MB.',

            'sku.required' => 'El código SKU es obligatorio.',
            'sku.string' => 'El código SKU debe ser un texto.',
            'sku.max' => 'El código SKU no puede superar los 255 caracteres.',
            'sku.unique' => 'Ya existe otro producto con ese código SKU.',

            'name.required' => 'El nombre del producto es obligatorio.',
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede superar los 255 caracteres.',

            'description.string' => 'La descripción debe ser un texto.',

            'price.required' => 'El precio del producto es obligatorio.',
            'price.numeric' => 'El precio debe ser un número.',
            'price.min' => 'El precio no puede ser negativo.',

            'subcategory_id.required' => 'Debes seleccionar una subcategoría.',
            'subcategory_id.exists' => 'La subcategoría seleccionada no existe.',

            'estado.required' => 'Debes indicar el estado del producto.',
            'estado.boolean' => 'El estado debe ser activo o inactivo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'image' => 'imagen',
            'sku' => 'código SKU',
            'name' => 'nombre',
            'description' => 'descripción',
            'price' => 'precio',
            'subcategory_id' => 'subcategoría',
            'estado' => 'estado',
        ];
    }
}
