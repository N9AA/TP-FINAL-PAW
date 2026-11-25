
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\WebhookController;
use App\Http\Middleware\VerifyStock;

// Página principal
Route::get('/', [WelcomeController::class, 'index'])
    ->name('home');

// Familias, categorías y productos
Route::get('families/{family}', [FamilyController::class, 'show'])
    ->name('families.show');

Route::get('categories/{category}', [CategoryController::class, 'show'])
    ->name('categories.show');

Route::get('subcategories/{subcategory}', [SubcategoryController::class, 'show'])
    ->name('subcategories.show');

Route::get('products/{product}', [ProductController::class, 'show'])
    ->name('products.show');

// Carrito de compras
Route::middleware(VerifyStock::class)->group(function () {
    Route::get('/cart', [CartController::class, 'index'])
        ->name('cart.index');

    Route::post('/cart/products/{product}', [CartController::class, 'add'])
        ->name('cart.add');

    Route::patch('/cart/{rowId}/increase', [CartController::class, 'increase'])
        ->name('cart.increase');

    Route::patch('/cart/{rowId}/decrease', [CartController::class, 'decrease'])
        ->name('cart.decrease');

    Route::delete('/cart/{rowId}', [CartController::class, 'remove'])
        ->name('cart.remove');

    Route::delete('/cart', [CartController::class, 'destroy'])
        ->name('cart.destroy');
});

// Direcciones de envío y checkout
Route::middleware(['auth'])->group(function () {
    Route::get('shipping', [ShippingController::class, 'index'])
        ->name('shipping.index');

    Route::post('shipping', [ShippingController::class, 'store'])
        ->name('shipping.store');

    Route::put('shipping/{address}', [ShippingController::class, 'update'])
        ->name('shipping.update');

    Route::delete('shipping/{address}', [ShippingController::class, 'destroy'])
        ->name('shipping.destroy');

    Route::patch('shipping/{address}/default', [ShippingController::class, 'setDefault'])
        ->name('shipping.default');

    // Checkout
    Route::middleware(VerifyStock::class)->group(function () {
        Route::get('checkout', [CheckoutController::class, 'index'])
            ->name('checkout.index');

        Route::post('checkout/pagar', [CheckoutController::class, 'crearPreferencia'])
            ->name('checkout.pagar');
    });

    // Confirmar compra y vaciar el carrito después de verificar el pago
    Route::post('checkout/ordenes/{order}/confirmar', [
        CheckoutController::class,
        'confirmarCompra',
    ])->name('checkout.confirmar');
});

// Página de agradecimiento
Route::get('gracias', [CheckoutController::class, 'gracias'])
    ->name('checkout.gracias');

// Webhook de Mercado Pago
Route::post('/webhooks/mercadopago', [WebhookController::class, 'mercadopago'])
    ->name('webhooks.mercadopago');

require __DIR__ . '/settings.php';
