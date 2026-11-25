<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubcategoryRequest;
use App\Http\Requests\UpdateSubcategoryRequest;
use App\Models\Subcategory;
use App\Models\Category;
use App\Models\Family;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubcategoryController extends Controller
{
    public function index(Request $request)
    {
        $buscar = trim($request->input('buscar') ?? '');
        $familia = $request->input('familia') ?? '';
        $categoria = $request->input('categoria') ?? '';
        $estado = $request->input('estado') ?? '';

        $orden = $request->input('orden', 'id');
        $direccion = $request->input('direccion', 'desc');
        $porPagina = (int) $request->input('por_pagina', 10);

        // Validamos los valores permitidos.
        $camposPermitidos = ['id', 'name', 'categoria', 'familia', 'estado'];

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

        // Consulta de subcategorías y aplicación de filtros.
        $subcategories = Subcategory::query()
            ->with('category.family')
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where('subcategories.name', 'like', "%{$buscar}%");
            })
            ->when($categoria !== '', function ($query) use ($categoria) {
                $query->where('subcategories.category_id', $categoria);
            })
            ->when($familia !== '', function ($query) use ($familia) {
                $query->whereHas('category', function ($query) use ($familia) {
                    $query->where('family_id', $familia);
                });
            })
            ->when($estado !== '', function ($query) use ($estado) {
                $query->where('subcategories.estado', $estado);
            });

        // Ordenamiento.
        if ($orden === 'categoria') {
            $subcategories->leftJoin(
                'categories',
                'subcategories.category_id',
                '=',
                'categories.id'
            )
                ->orderBy('categories.name', $direccion)
                ->select('subcategories.*');

        } elseif ($orden === 'familia') {
            $subcategories->leftJoin(
                'categories',
                'subcategories.category_id',
                '=',
                'categories.id'
            )
                ->leftJoin(
                    'families',
                    'categories.family_id',
                    '=',
                    'families.id'
                )
                ->orderBy('families.name', $direccion)
                ->select('subcategories.*');

        } else {
            $subcategories->orderBy('subcategories.' . $orden, $direccion);
        }

        // Paginación.
        $subcategories = $subcategories
            ->paginate($porPagina)
            ->withQueryString();

        return Inertia::render('admin/subcategories/Index', [
            'subcategories' => $subcategories,
            'families' => Family::orderBy('name')->get(),
            'categories' => Category::orderBy('name')
                ->select('id', 'name', 'family_id')
                ->get(),
            'filtros' => [
                'buscar' => $buscar,
                'familia' => $familia,
                'categoria' => $categoria,
                'estado' => $estado,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
            ],
        ]);
    }

    public function create()
    {
        $families = Family::orderBy('name')->get();

        $categories = Category::orderBy('name')
            ->select('id', 'name', 'family_id')
            ->get();

        return Inertia::render('admin/subcategories/Create', [
            'families' => $families,
            'categories' => $categories,
        ]);
    }

    public function store(StoreSubcategoryRequest $request)
    {
        $validated = $request->validated();

        Subcategory::create($validated);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Subcategoría creada correctamente.',
        ]);

        return redirect()->route('admin.subcategories.index');
    }

    public function show(Subcategory $subcategory)
    {
        //
    }

    public function edit(Subcategory $subcategory)
    {
        $families = Family::orderBy('name')->get();

        $categories = Category::orderBy('name')
            ->select('id', 'name', 'family_id')
            ->get();

        $subcategory->load('category');

        return Inertia::render('admin/subcategories/Edit', [
            'subcategory' => $subcategory,
            'families' => $families,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateSubcategoryRequest $request, Subcategory $subcategory)
    {
        $validated = $request->validated();

        $subcategory->update($validated);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Subcategoría actualizada correctamente.',
        ]);

        return redirect()->route('admin.subcategories.index');
    }

    public function destroy(Subcategory $subcategory)
    {
        // Verificamos si tiene productos asociados.
        if ($subcategory->products()->exists()) {
            session()->flash('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'No se puede eliminar la subcategoría porque tiene productos asociados.',
            ]);

            return redirect()->route('admin.subcategories.index');
        }

        // Si no tiene productos, la eliminamos.
        $subcategory->delete();

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Subcategoría eliminada correctamente.',
        ]);

        return redirect()->route('admin.subcategories.index');
    }
}
