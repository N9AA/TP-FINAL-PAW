
<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FamilyController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OptionController;
use App\Http\Controllers\Admin\CoverController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Admin\SalesReportController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ========================================
// DASHBOARD
// ========================================

Route::get('/', [DashboardController::class, 'index'])
    ->middleware(['auth', 'can:access dashboard'])
    ->name('dashboard');

// ========================================
// OPCIONES GENERALES
// ========================================

Route::middleware(['auth', 'can:manage options'])->group(function () {

    Route::get('/options', [OptionController::class, 'index'])
        ->name('options.index');

    Route::post('/options', [OptionController::class, 'store'])
        ->name('options.store');

    Route::post('/options/{option}/features', [OptionController::class, 'storeFeature'])
        ->name('options.features.store');

    Route::delete('/features/{feature}', [OptionController::class, 'destroyFeature'])
        ->name('features.destroy');

    Route::delete('/options/{option}', [OptionController::class, 'destroy'])
        ->name('options.destroy');
});

// ========================================
// FAMILIAS
// ========================================

Route::middleware(['auth', 'can:manage families'])->group(function () {
    Route::resource('families', FamilyController::class);
});

// ========================================
// CATEGORÍAS
// ========================================

Route::middleware(['auth', 'can:manage categories'])->group(function () {
    Route::resource('categories', CategoryController::class);
});

// ========================================
// SUBCATEGORÍAS
// ========================================

Route::middleware(['auth', 'can:manage subcategories'])->group(function () {
    Route::resource('subcategories', SubcategoryController::class);
});

// ========================================
// PRODUCTOS
// ========================================

Route::middleware(['auth', 'can:manage products'])->group(function () {

    // Exportar productos a Excel
    Route::get('products/export', [ProductController::class, 'export'])
        ->name('products.export');

    // CRUD de productos
    Route::resource('products', ProductController::class);

    // Opciones y características por producto

    Route::post('products/{product}/options', [ProductController::class, 'storeOption'])
        ->name('products.options.store')
        ->scopeBindings();

    Route::put('products/{product}/options/{option}/features', [ProductController::class, 'updateOptionFeatures'])
        ->name('products.options.features.update')
        ->scopeBindings();

    Route::delete('products/{product}/options/{option}', [ProductController::class, 'destroyOption'])
        ->name('products.options.destroy')
        ->scopeBindings();

    Route::delete('products/{product}/options/{option}/features/{feature}', [ProductController::class, 'destroyOptionFeature'])
        ->name('products.options.features.destroy')
        ->scopeBindings();

    // Edición individual de variantes

    Route::get('products/{product}/variants/{variant}', [ProductController::class, 'variants'])
        ->name('products.variants')
        ->scopeBindings();

    Route::put('products/{product}/variants/{variant}', [ProductController::class, 'variantsUpdate'])
        ->name('products.variantsUpdate')
        ->scopeBindings();
});

// ========================================
// CONFIGURACIÓN DEL ADMINISTRADOR
// ========================================

Route::middleware(['auth'])->group(function () {

    // Perfil

    Route::get('perfil', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('perfil', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::post('perfil/photo', [ProfileController::class, 'updatePhoto'])
        ->name('profile.photo.update');

    Route::delete('perfil/photo', [ProfileController::class, 'deletePhoto'])
        ->name('profile.photo.delete');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Eliminar perfil

    Route::delete('perfil', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    // Seguridad

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->name('security.edit');

    // Actualizar contraseña

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    // Apariencia

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance', [
            'isAdmin' => true,
        ]);
    })->name('appearance.edit');
});

// ========================================
// CRUD DE PORTADAS
// ========================================

Route::middleware(['auth', 'can:manage covers'])->group(function () {
    Route::resource('covers', CoverController::class);
});

// ========================================
// ÓRDENES
// ========================================

Route::middleware(['auth', 'can:manage orders'])->group(function () {

    Route::get('orders', [OrderController::class, 'index'])
        ->name('orders.index');

    Route::get('orders/{order}/ticket', [OrderController::class, 'downloadTicket'])
        ->name('orders.ticket');

    Route::patch('orders/{order}/processing', [OrderController::class, 'markAsProcessing'])
        ->name('orders.processing');

    Route::post('orders/{order}/shipments', [OrderController::class, 'storeShipment'])
        ->name('orders.shipments.store');

    Route::patch('orders/{order}/refunded', [OrderController::class, 'markAsRefunded'])
        ->name('orders.refunded');

    Route::patch('orders/{order}/cancel', [OrderController::class, 'cancelOrder'])
        ->name('orders.cancel');
});

// ========================================
// CONDUCTORES
// ========================================

Route::middleware(['auth', 'can:manage drivers'])->group(function () {
    Route::resource('drivers', DriverController::class);
});

// ========================================
// ENVÍOS
// ========================================

Route::middleware(['auth', 'can:manage shipments'])->group(function () {

    Route::get('shipments', [ShipmentController::class, 'index'])
        ->name('shipments.index');

    Route::patch('shipments/{shipment}/completed', [ShipmentController::class, 'markAsCompleted'])
        ->name('shipments.completed');

    Route::patch('shipments/{shipment}/failed', [ShipmentController::class, 'markAsFailed'])
        ->name('shipments.failed');
});

// ========================================
// ROLES
// ========================================

Route::middleware(['auth', 'can:manage roles'])->group(function () {
    Route::resource('roles', RoleController::class);
});

// ========================================
// PERMISOS
// ========================================

Route::middleware(['auth', 'can:manage permissions'])->group(function () {
    Route::resource('permissions', PermissionController::class)
        ->except(['show', 'edit', 'create']);
});

// ========================================
// USUARIOS
// ========================================

Route::middleware(['auth', 'can:manage users'])->group(function () {
    Route::resource('users', UserController::class);
});

// ========================================
// REPORTE PDF DE VENTAS
// ========================================

Route::get('/reports/sales', [SalesReportController::class, 'generate'])
    ->middleware(['auth', 'can:access dashboard'])
    ->name('reports.sales');
