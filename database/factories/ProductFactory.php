<?php
namespace Database\Factories;

use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sku' => $this->faker->unique()->numerify('########'),
            'name' => 'Producto de prueba',
            'description' => $this->faker->paragraph(),
            'image_path' => 'products/placeholder.png',
            'price' => $this->faker->randomFloat(2, 1000, 30000),
            'subcategory_id' => Subcategory::query()->value('id'),
            'estado' => true,
        ];
    }
}
