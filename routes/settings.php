
<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ========================================
// CONFIGURACIÓN DE LA TIENDA
// ========================================

Route::middleware(['auth'])->group(function () {

    Route::redirect('settings', '/perfil');

    // Perfil
    Route::get('perfil', [ProfileController::class, 'edit'])
        ->name('store.profile.edit');

    Route::patch('perfil', [ProfileController::class, 'update'])
        ->name('store.profile.update');

    Route::post('perfil/photo', [ProfileController::class, 'updatePhoto'])
        ->name('store.profile.photo.update');

    Route::delete('perfil/photo', [ProfileController::class, 'deletePhoto'])
        ->name('store.profile.photo.delete');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Eliminar perfil
    Route::delete('perfil', [ProfileController::class, 'destroy'])
        ->name('store.profile.destroy');

    // Seguridad
    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->name('store.security.edit');

    // Actualizar contraseña
    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('store.user-password.update');

    // Apariencia
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance', [
            'isAdmin' => false,
        ]);
    })->name('store.appearance.edit');
});
