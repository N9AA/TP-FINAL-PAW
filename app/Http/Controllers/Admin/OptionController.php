<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOptionRequest;
use App\Http\Requests\StoreFeatureRequest;
use App\Models\Option;
use App\Models\Feature;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OptionController extends Controller
{
    // Mostrar todas las opciones y sus valores
    public function index()
    {
        $options = Option::with('features')->get();

        return Inertia::render('admin/options/Index', [
            'options' => $options,
        ]);
    }

    // Crear una nueva opción con sus valores
    public function store(StoreOptionRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $option = Option::create([
                'name' => $validated['name'],
                'type' => $validated['type'],
            ]);

            foreach ($validated['features'] as $feature) {
                $option->features()->create([
                    'value' => $feature['value'],
                    'description' => $feature['description'],
                ]);
            }
        });

        return redirect()
            ->route('admin.options.index')
            ->with('success', '¡La opción se agregó correctamente!');
    }

    // Agregar un valor a una opción existente
    public function storeFeature(StoreFeatureRequest $request, Option $option)
    {
        $validated = $request->validated();

        $option->features()->create($validated);

        return redirect()
            ->route('admin.options.index')
            ->with('success', '¡El valor se agregó correctamente!');
    }

    // Eliminar un valor
    public function destroyFeature(Feature $feature)
    {
        $feature->delete();

        return redirect()
            ->route('admin.options.index')
            ->with('success', '¡El valor se eliminó correctamente!');
    }

    // Eliminar una opción
    public function destroy(Option $option)
    {
        $option->delete();

        return redirect()
            ->route('admin.options.index')
            ->with('success', '¡La opción se eliminó correctamente!');
    }
}