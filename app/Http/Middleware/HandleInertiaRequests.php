<?php
namespace App\Http\Middleware;

use App\Models\Family;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Gloudemans\Shoppingcart\Facades\Cart;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'name' => config('app.name'),

            'families' => fn () => Family::with('categories.subcategories')->get(),

            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'profile_photo_url' => $user->profile_photo_path
                        ? asset('storage/' . $user->profile_photo_path)
                        : null,
                ] : null,

                'permissions' => $user
                    ? $user->getAllPermissions()->pluck('name')->values()
                    : [],
            ],

            'cartCount' => Cart::instance('shopping')->count(),

            'sidebarOpen' => ! $request->hasCookie('sidebar_state')
                || $request->cookie('sidebar_state') === 'true',

            'flash' => [
                'swal' => fn () => $request->session()->get('swal'),
            ],
        ];
    }
}


