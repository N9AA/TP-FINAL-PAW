<?php

namespace App\Http\Controllers;

use App\Models\Subcategory;
use App\Models\Option;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubcategoryController extends Controller
{
    public function show(Request $request, Subcategory $subcategory)
    {
        // Verificar que la subcategoría, categoría y familia estén activas
        abort_unless(
            $subcategory->estado &&
            $subcategory->category &&
            $subcategory->category->estado &&
            $subcategory->category->family &&
            $subcategory->category->family->estado,
            404
        );

        $selectedFeatures = $request->input('selected_features', []);
        $orderBy = $request->input('orderBy', 1);
        $search = $request->input('search');

        $options = Option::verifySubcategory($subcategory->id)
            ->get();

        $products = Product::verifySubcategory($subcategory->id)
            ->where('estado', true)
            ->customOrder($orderBy)
            ->selectFeatures($selectedFeatures)
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('subcategories/Show', [
            'subcategory' => $subcategory->load('category.family'),
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