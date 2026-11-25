<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\Variant;

class ProductObserver
{
    public function created(Product $product): void
    {
        Variant::create([
            'product_id' => $product->id,
            'sku' => $product->sku,
            'stock' => 10,
        ]);
    }
}