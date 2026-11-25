<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Option;

class OptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            [
                'name' => 'Color',
                'type' => 2,
                'features' => [
                    ['value' => '#F4C2D7', 'description' => 'Rosa pastel'],
                    ['value' => '#D8C4E8', 'description' => 'Lila'],
                    ['value' => '#B9A5D6', 'description' => 'Lavanda'],
                    ['value' => '#C5DFED', 'description' => 'Celeste'],
                    ['value' => '#B7C9B0', 'description' => 'Verde salvia'],
                    ['value' => '#F3EBDD', 'description' => 'Crema'],
                    ['value' => '#FFFFFF', 'description' => 'Blanco'],
                    ['value' => '#000000', 'description' => 'Negro'],
                    ['value' => '#A67C52', 'description' => 'Marrón'],
                ],
            ],
            [
                'name' => 'Diseño',
                'type' => 1,
                'features' => [
                    ['value' => 'floral', 'description' => 'Floral'],
                    ['value' => 'corazones', 'description' => 'Corazones'],
                    ['value' => 'estrellas', 'description' => 'Estrellas'],
                    ['value' => 'kawaii', 'description' => 'Kawaii'],
                    ['value' => 'minimalista', 'description' => 'Minimalista'],
                    ['value' => 'mariposas', 'description' => 'Mariposas'],
                    ['value' => 'abstracto', 'description' => 'Abstracto'],
                    ['value' => 'espacial', 'description' => 'Espacial'],
                ],
            ],
            [
                'name' => 'Tamaño',
                'type' => 1,
                'features' => [
                    ['value' => 'a4', 'description' => 'A4'],
                    ['value' => 'a5', 'description' => 'A5'],
                    ['value' => 'a6', 'description' => 'A6'],
                    ['value' => 'pequeno', 'description' => 'Pequeño'],
                    ['value' => 'mediano', 'description' => 'Mediano'],
                    ['value' => 'grande', 'description' => 'Grande'],
                ],
            ],
            [
                'name' => 'Color de tinta',
                'type' => 1,
                'features' => [
                    ['value' => 'negro', 'description' => 'Negro'],
                    ['value' => 'azul', 'description' => 'Azul'],
                    ['value' => 'rojo', 'description' => 'Rojo'],
                    ['value' => 'violeta', 'description' => 'Violeta'],
                    ['value' => 'verde', 'description' => 'Verde'],
                ],
            ],
            [
                'name' => 'Grosor de punta',
                'type' => 1,
                'features' => [
                    ['value' => '0.3mm', 'description' => '0.3 mm'],
                    ['value' => '0.5mm', 'description' => '0.5 mm'],
                    ['value' => '0.7mm', 'description' => '0.7 mm'],
                    ['value' => '1.0mm', 'description' => '1.0 mm'],
                ],
            ],
            [
                'name' => 'Cantidad',
                'type' => 1,
                'features' => [
                    ['value' => '6 unidades', 'description' => '6 unidades'],
                    ['value' => '12 unidades', 'description' => '12 unidades'],
                    ['value' => '24 unidades', 'description' => '24 unidades'],
                    ['value' => '48 unidades', 'description' => '48 unidades'],
                ],
            ],
            [
                'name' => 'Tipo de punta',
                'type' => 1,
                'features' => [
                    ['value' => 'fina', 'description' => 'Fina'],
                    ['value' => 'media', 'description' => 'Media'],
                    ['value' => 'gruesa', 'description' => 'Gruesa'],
                    ['value' => 'brush', 'description' => 'Brush'],
                ],
            ],
        ];

        foreach ($options as $option) {
            $optionModel = Option::updateOrCreate(
                ['name' => $option['name']],
                ['type' => $option['type']]
            );

            foreach ($option['features'] as $feature) {
                $optionModel->features()->updateOrCreate(
                    ['value' => $feature['value']],
                    ['description' => $feature['description']]
                );
            }
        }
    }
}
