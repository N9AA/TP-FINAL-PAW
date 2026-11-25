<?php

namespace App\Observers;

use App\Models\Variant;
use Illuminate\Support\Str;

class VariantObserver
{
    public function created(Variant $variant): void
    {
        if ($variant->product->options()->count() === 0) {
            $variant->sku = $variant->product->sku;
            $variant->stock = 10;
        } elseif (empty($variant->sku)) {
            $variant->sku = Str::random(12);
        }

        $variant->saveQuietly();
    }
}