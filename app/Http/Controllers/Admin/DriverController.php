<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDriverRequest;
use App\Http\Requests\UpdateDriverRequest;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = trim($request->input('buscar', ''));

        // Columnas permitidas para ordenar
        $orden = $request->input('orden', 'id');

        if (!in_array($orden, ['id', 'name', 'type'], true)) {
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

        $drivers = Driver::with('user')
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    if (is_numeric($buscar)) {
                        $q->where('drivers.id', (int) $buscar);
                    }

                    $q->orWhereHas('user', function ($userQuery) use ($buscar) {
                        $userQuery->where('name', 'like', "%{$buscar}%");
                    });
                });
            })
            ->when($orden === 'name', function ($query) use ($direccion) {
                $query->orderBy(
                    User::select('name')
                        ->whereColumn('users.id', 'drivers.user_id'),
                    $direccion
                );
            }, function ($query) use ($orden, $direccion) {
                $query->orderBy('drivers.' . $orden, $direccion);
            })
            ->paginate($porPagina)
            ->withQueryString();

        return Inertia::render('admin/drivers/Index', [
            'drivers' => $drivers,
            'filtros' => [
                'buscar' => $buscar,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/drivers/Create', [
            'users' => User::select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreDriverRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Driver::create($validated);

        return redirect()
            ->route('admin.drivers.index')
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Conductor registrado!',
                'text' => 'El conductor ha sido registrado exitosamente.',
            ]);
    }

    public function show(Driver $driver): RedirectResponse
    {
        return redirect()->route('admin.drivers.edit', $driver);
    }

    public function edit(Driver $driver): Response
    {
        $driver->load('user');

        return Inertia::render('admin/drivers/Edit', [
            'driver' => $driver,
            'users' => User::select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(UpdateDriverRequest $request, Driver $driver): RedirectResponse
    {
        $validated = $request->validated();

        $driver->update($validated);

        return redirect()
            ->route('admin.drivers.index')
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Conductor actualizado!',
                'text' => 'El conductor ha sido actualizado exitosamente.',
            ]);
    }

    public function destroy(Driver $driver): RedirectResponse
    {
        if ($driver->shipments()->exists()) {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => 'No se puede eliminar',
                'text' => 'Este conductor tiene envíos asignados.',
            ]);
        }

        $driver->delete();

        return redirect()
            ->route('admin.drivers.index')
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Conductor eliminado!',
                'text' => 'El conductor ha sido eliminado exitosamente.',
            ]);
    }
}
