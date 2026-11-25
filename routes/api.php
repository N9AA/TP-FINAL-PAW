
<?php

use App\Http\Controllers\Api\SortController;
use Illuminate\Support\Facades\Route;

Route::post('/sort/covers', [SortController::class, 'covers'])
    ->name('sort.covers');
