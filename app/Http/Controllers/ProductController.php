<?php
namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        // Verificar que toda la jerarquía esté activa
        abort_unless(
            $product->estado &&
            $product->subcategory &&
            $product->subcategory->estado &&
            $product->subcategory->category &&
            $product->subcategory->category->estado &&
            $product->subcategory->category->family &&
            $product->subcategory->category->family->estado,
            404
        );

        $product->load([
            'subcategory.category.family',
            'options',
            'variants.features',
        ]);

        $product->options->each(function ($option) {
            $features = $option->pivot->features;

            if (is_string($features)) {
                $features = json_decode($features, true);
            }

            $option->pivot->features = array_values($features ?? []);
        });

        return Inertia::render('products/Show', [
            'product' => $product,
        ]);
    }
}
