<?php
namespace App\Http\Middleware;

use App\Models\Variant;
use Closure;
use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyStock
{
    public function handle(Request $request, Closure $next): Response
    {
        Cart::instance('shopping');

        foreach (Cart::content() as $item) {
            $options = $item->options->toArray();

            $sku = $options['sku'] ?? null;

            $variant = $sku
                ? Variant::where('sku', $sku)->first()
                : null;

            $options['stock'] = (int) ($variant?->stock ?? 0);

            Cart::update($item->rowId, [
                'options' => $options,
            ]);
        }

        return $next($request);
    }
}
