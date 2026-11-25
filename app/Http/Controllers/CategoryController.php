<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Option;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function show(Request $request, Category $category)
    {
        // Verificar que la categoría y su familia estén activas
        abort_unless(
            $category->estado && $category->family->estado,
            404
        );

        $selectedFeatures = $request->input('selected_features', []);
        $orderBy = $request->input('orderBy', 1);
        $search = $request->input('search');

        $options = Option::verifyCategory($category->id)
            ->get();

        $products = Product::verifyCategory($category->id)
            ->where('estado', true)
            ->whereHas('subcategory', function ($query) {
                $query->where('estado', true);
            })
            ->customOrder($orderBy)
            ->selectFeatures($selectedFeatures)
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('categories/Show', [
            'category' => $category->load('family'),
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