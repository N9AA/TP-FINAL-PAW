<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'title' => is_string($this->title)
                ? trim($this->title)
                : $this->title,
        ]);
    }

    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'image',
                'max:1024',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'start_at' => [
                'required',
                'date',
            ],
            'end_at' => [
                'nullable',
                'date',
                'after_or_equal:start_at',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Debes seleccionar una imagen para la portada.',
            'image.image' => 'El archivo seleccionado debe ser una imagen.',
            'image.max' => 'La imagen no puede superar 1 MB.',

            'title.required' => 'El título de la portada es obligatorio.',
            'title.string' => 'El título debe ser un texto.',
            'title.max' => 'El título no puede superar los 255 caracteres.',

            'start_at.required' => 'Debes indicar la fecha de inicio.',
            'start_at.date' => 'La fecha de inicio no es válida.',

            'end_at.date' => 'La fecha de finalización no es válida.',
            'end_at.after_or_equal' => 'La fecha de finalización debe ser igual o posterior a la fecha de inicio.',

            'is_active.required' => 'Debes indicar si la portada está activa.',
            'is_active.boolean' => 'El estado debe ser activo o inactivo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'image' => 'imagen',
            'title' => 'título',
            'start_at' => 'fecha de inicio',
            'end_at' => 'fecha de finalización',
            'is_active' => 'estado',
        ];
    }
}
