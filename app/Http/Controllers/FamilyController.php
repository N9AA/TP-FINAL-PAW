<?php

namespace App\Http\Controllers;

use App\Models\Family;
use App\Models\Option;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FamilyController extends Controller
{
    public function show(Request $request, Family $family)
    {
        abort_unless($family->estado, 404);

        $selectedFeatures = $request->input('selected_features', []);
        $orderBy = $request->input('orderBy', 1);
        $search = $request->input('search');

        $options = Option::verifyFamily($family->id)
            ->get();

        $products = Product::verifyFamily($family->id)
            ->where('estado', true)
            ->whereHas('subcategory', function ($query) {
                $query->where('estado', true)
                    ->whereHas('category', function ($query) {
                        $query->where('estado', true);
                    });
            })
            ->customOrder($orderBy)
            ->selectFeatures($selectedFeatures)
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('families/Show', [
            'family' => $family,
            'options' => $options,
            'products' => $products,
            'filters' => [
                'selected_features' => $selectedFeatures,
                'orderBy' => $orderBy,
                'search' => $search,
            ],
        ]);
    }
}