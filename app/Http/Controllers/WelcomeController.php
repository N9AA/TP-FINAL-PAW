<?php
namespace App\Http\Controllers;

use App\Models\Cover;
use App\Models\Family;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index(Request $request)
    {
        $covers = Cover::where('is_active', true)
            ->whereDate('start_at', '<=', now())
            ->where(function ($query) {
                $query->whereDate('end_at', '>=', now())
                    ->orWhereNull('end_at');
            })
            ->orderBy('order')
            ->get()
            ->each->append('image');

        $search = $request->input('search');

        $lastProducts = Product::where('estado', true)
            ->whereHas('subcategory', function ($query) {
                $query->where('estado', true)
                    ->whereHas('category', function ($query) {
                        $query->where('estado', true)
                            ->whereHas('family', function ($query) {
                                $query->where('estado', true);
                            });
                    });
            })
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->orderBy('created_at', 'desc')
            ->take(12)
            ->get()
            ->each->append('image');

        $families = Family::where('estado', true)
            ->with([
                'categories' => function ($query) {
                    $query->where('estado', true)
                        ->with([
                            'subcategories' => function ($query) {
                                $query->where('estado', true);
                            }
                        ]);
                }
            ])
            ->get();

        return Inertia::render('welcome', [
            'covers' => $covers,
            'lastProducts' => $lastProducts,
            'families' => $families,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
