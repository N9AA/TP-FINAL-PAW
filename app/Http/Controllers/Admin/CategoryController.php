<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Family;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $buscar = trim($request->input('buscar') ?? '');
        $familia = $request->input('familia') ?? '';
        $estado = $request->input('estado') ?? '';

        $orden = $request->input('orden', 'id');
        $direccion = $request->input('direccion', 'desc');
        $porPagina = (int) $request->input('por_pagina', 10);

        // Validamos los valores permitidos.
        $camposPermitidos = ['id', 'name', 'familia', 'estado'];

        if (!in_array($orden, $camposPermitidos, true)) {
            $orden = 'id';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'desc';
        }

        if (!in_array($porPagina, [5, 10, 20], true)) {
            $porPagina = 10;
        }

        if (!in_array($estado, ['', '1', '0'], true)) {
            $estado = '';
        }

        // Consulta de categorías y aplicación de filtros.
        $categories = Category::query()
            ->with('family')
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where('categories.name', 'like', "%{$buscar}%");
            })
            ->when($familia !== '', function ($query) use ($familia) {
                $query->where('categories.family_id', $familia);
            })
            ->when($estado !== '', function ($query) use ($estado) {
                $query->where('categories.estado', $estado);
            });

        // Ordenamiento.
        if ($orden === 'familia') {
            $categories->leftJoin(
                'families',
                'categories.family_id',
                '=',
                'families.id'
            )
                ->orderBy('families.name', $direccion)
                ->select('categories.*');
        } else {
            $categories->orderBy('categories.' . $orden, $direccion);
        }

        // Paginación.
        $categories = $categories
            ->paginate($porPagina)
            ->withQueryString();

        return Inertia::render('admin/categories/Index', [
            'categories' => $categories,
            'families' => Family::orderBy('name')->get(),
            'filtros' => [
                'buscar' => $buscar,
                'familia' => $familia,
                'estado' => $estado,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $families = Family::orderBy('name')->get();

        return Inertia::render('admin/categories/Create', compact('families'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $validated = $request->validated();

        Category::create($validated);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Categoría creada correctamente',
        ]);

        return redirect()->route('admin.categories.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        $families = Family::orderBy('name')->get();

        return Inertia::render(
            'admin/categories/Edit',
            compact('category', 'families')
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $validated = $request->validated();

        $category->update($validated);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Categoría actualizada correctamente.',
        ]);

        return redirect()->route('admin.categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        if ($category->subcategories()->count() > 0) {
            session()->flash('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'No se puede eliminar la categoría porque tiene subcategorías asociadas.',
            ]);

            return redirect()->route('admin.categories.index');
        }

        $category->delete();

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Categoría eliminada correctamente.',
        ]);

        return redirect()->route('admin.categories.index');
    }
}
