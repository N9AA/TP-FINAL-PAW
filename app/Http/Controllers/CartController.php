<?php
namespace App\Http\Controllers;

use App\Http\Middleware\VerifyStock;
use App\Models\Product;
use App\Models\Variant;
use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CartController extends Controller
{
    
    public function index()
    {
        Cart::instance('shopping');

        $cartItems = Cart::content()->map(function ($item) {
            return [
                'rowId' => $item->rowId,
                'id' => $item->id,
                'name' => $item->name,
                'qty' => (int) $item->qty,
                'price' => (float) $item->price,
                'options' => $item->options->toArray(),
            ];
        })->values();

        $cartSubtotal = $cartItems
            ->filter(function ($item) {
                return $item['qty'] <= (int) ($item['options']['stock'] ?? 0);
            })
            ->sum(function ($item) {
                return $item['price'] * $item['qty'];
            });

        return Inertia::render('cart/Index', [
            'cartItems' => $cartItems,
            'cartCount' => Cart::count(),
            'cartSubtotal' => $cartSubtotal,
        ]);
    }

    public function add(Request $request, Product $product)
    {
        Cart::instance('shopping');

        $validated = $request->validate([
            'qty' => ['nullable', 'integer', 'min:1'],
            'variant_id' => ['required', 'integer'],
        ]);

        $qty = (int) ($validated['qty'] ?? 1);

        $added = DB::transaction(function () use ($product, $validated, $qty) {
            $variant = Variant::whereKey($validated['variant_id'])
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();

            $stock = (int) $variant->stock;

            $existingQty = Cart::content()
                ->filter(function ($item) use ($variant) {
                    return (int) ($item->options->variant_id ?? 0) === (int) $variant->id;
                })
                ->sum(function ($item) {
                    return (int) $item->qty;
                });

            if ($stock < 1 || ($existingQty + $qty) > $stock) {
                return false;
            }

            $variant->loadMissing('features');

            $image = $variant->image ?? $product->image;

            $features = $variant->features
                ->pluck('description', 'id')
                ->toArray();

            Cart::add([
                'id' => $product->id,
                'name' => $product->name,
                'qty' => $qty,
                'price' => $product->price,
                'options' => [
                    'image' => $image,
                    'sku' => $variant->sku,
                    'variant_id' => $variant->id,
                    'features' => $features,
                    'stock' => $stock,
                ],
            ]);

            $this->storeCart();

            return true;
        });

        if (!$added) {
            return back()->with('swal', [
                'id' => (string) Str::uuid(),
                'icon' => 'error',
                'title' => 'Stock insuficiente',
                'text' => 'No hay suficientes unidades disponibles para esa cantidad.',
            ]);
        }

        return back()->with('swal', [
            'id' => (string) Str::uuid(),
            'icon' => 'success',
            'title' => 'Agregar al carrito',
            'text' => 'El producto se ha añadido al carrito de compras.',
        ]);
    }

    public function increase(string $rowId)
    {
        Cart::instance('shopping');

        $increased = DB::transaction(function () use ($rowId) {
            $item = Cart::get($rowId);

            $variantId = $item->options->variant_id ?? null;
            $sku = $item->options->sku ?? null;

            $variant = $variantId
                ? Variant::whereKey($variantId)
                    ->where('sku', $sku)
                    ->where('product_id', $item->id)
                    ->lockForUpdate()
                    ->first()
                : null;

            if (!$variant) {
                return false;
            }

            $totalQty = Cart::content()
                ->filter(function ($cartItem) use ($variant) {
                    return (int) ($cartItem->options->variant_id ?? 0) === (int) $variant->id;
                })
                ->sum(function ($cartItem) {
                    return (int) $cartItem->qty;
                });

            if (($totalQty + 1) > (int) $variant->stock) {
                return false;
            }

            $options = $item->options->toArray();
            $options['stock'] = (int) $variant->stock;

            Cart::update($rowId, [
                'qty' => (int) $item->qty + 1,
                'options' => $options,
            ]);

            $this->storeCart();

            return true;
        });

        if (!$increased) {
            return back()->with('swal', [
                'id' => (string) Str::uuid(),
                'icon' => 'error',
                'title' => 'Stock insuficiente',
                'text' => 'No hay más unidades disponibles de este producto.',
            ]);
        }

        return back();
    }

    public function decrease(string $rowId)
    {
        Cart::instance('shopping');

        $item = Cart::get($rowId);

        if ($item->qty > 1) {
            Cart::update($rowId, (int) $item->qty - 1);
        } else {
            Cart::remove($rowId);
        }

        $this->storeCart();

        return back();
    }

    public function remove(string $rowId)
    {
        Cart::instance('shopping')->remove($rowId);

        $this->storeCart();

        return back();
    }

    public function destroy()
    {
        Cart::instance('shopping')->destroy();

        $this->storeCart();

        return back();
    }

    private function storeCart(): void
    {
        if (Auth::check()) {
            Cart::instance('shopping')->store(Auth::id());
        }
    }
}

