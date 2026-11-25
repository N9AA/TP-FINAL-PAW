<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFamilyRequest;
use App\Http\Requests\UpdateFamilyRequest;
use App\Models\Family;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FamilyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $buscar = trim($request->input('buscar', ''));

        // Filtro por estado
        $estado = $request->input('estado', '');

        if (!in_array($estado, ['', '1', '0'], true)) {
            $estado = '';
        }

        // Columnas permitidas para ordenar
        $orden = $request->input('orden', 'id');

        if (!in_array($orden, ['id', 'name', 'estado'], true)) {
            $orden = 'id';
        }

        // Dirección permitida
        $direccion = $request->input('direccion', 'desc');

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'desc';
        }

        // Cantidad de registros por página
        $porPagina = $request->input('por_pagina', 10);

        if (!in_array((int) $porPagina, [5, 10, 20], true)) {
            $porPagina = 10;
        }

        $porPagina = (int) $porPagina;

        $families = Family::when($buscar !== '', function ($query) use ($buscar) {
            $query->where('name', 'like', "%{$buscar}%");
        })
            ->when($estado !== '', function ($query) use ($estado) {
                $query->where('estado', $estado);
            })
            ->orderBy($orden, $direccion)
            ->paginate($porPagina)
            ->withQueryString();

        return Inertia::render('admin/families/Index', [
            'families' => $families,
            'filtros' => [
                'buscar' => $buscar,
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
        return Inertia::render('admin/families/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFamilyRequest $request)
    {
        $validated = $request->validated();

        Family::create($validated);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Familia creada correctamente.'
        ]);

        return redirect()->route('admin.families.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Family $family)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Family $family)
    {
        return Inertia::render('admin/families/Edit', compact('family'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFamilyRequest $request, Family $family)
    {
        $validated = $request->validated();

        $family->update($validated);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Familia actualizada correctamente.'
        ]);

        return redirect()->route('admin.families.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Family $family)
    {
        if ($family->categories()->count() > 0) {
            session()->flash('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'No se puede eliminar esta familia porque tiene categorías asociadas.'
            ]);

            return redirect()->route('admin.families.index');
        }

        $family->delete();

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Familia eliminada correctamente.'
        ]);

        return redirect()->route('admin.families.index');
    }
}
