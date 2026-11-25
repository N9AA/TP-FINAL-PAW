<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCoverRequest;
use App\Http\Requests\UpdateCoverRequest;
use App\Models\Cover;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CoverController extends Controller
{
    /**
     * Mostrar el listado de portadas.
     */
    public function index()
    {
        $covers = Cover::orderBy('order')->get()->map(function ($cover) {
            return [
                'id' => $cover->id,
                'image' => $cover->image,
                'title' => $cover->title,
                'start_at' => $cover->start_at->format('Y-m-d'),
                'end_at' => $cover->end_at?->format('Y-m-d'),
                'is_active' => $cover->is_active,
            ];
        });

        return Inertia::render('admin/covers/Index', [
            'covers' => $covers,
        ]);
    }

    /**
     * Mostrar el formulario para crear una portada.
     */
    public function create()
    {
        return Inertia::render('admin/covers/Create');
    }

    /**
     * Guardar una portada nueva.
     */
    public function store(StoreCoverRequest $request)
    {
        $data = $request->validated();

        $data['image_path'] = Storage::put('covers', $data['image']);

        unset($data['image']);

        $cover = Cover::create($data);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Portada creada!',
            'text' => 'La portada se ha creado correctamente.',
        ]);

        return redirect()->route('admin.covers.index', $cover);
    }

    /**
     * Mostrar una portada.
     */
    public function show(Cover $cover)
    {
        //
    }

    /**
     * Mostrar el formulario para editar una portada.
     */
    public function edit(Cover $cover)
    {
        return Inertia::render('admin/covers/Edit', [
            'cover' => [
                'id' => $cover->id,
                'image' => $cover->image,
                'title' => $cover->title,
                'start_at' => $cover->start_at->format('Y-m-d'),
                'end_at' => $cover->end_at?->format('Y-m-d'),
                'is_active' => $cover->is_active,
            ],
        ]);
    }

    /**
     * Actualizar una portada.
     */
    public function update(UpdateCoverRequest $request, Cover $cover)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($cover->image_path) {
                Storage::delete($cover->image_path);
            }

            $data['image_path'] = Storage::put('covers', $data['image']);
        }

        unset($data['image']);

        $cover->update($data);

        session()->flash('swal', [
            'icon' => 'success',
            'title' => '¡Portada actualizada!',
            'text' => 'La portada se ha actualizado correctamente.',
        ]);

        return redirect()->route('admin.covers.index', $cover);
    }

    /**
     * Eliminar una portada.
     */
    public function destroy(Cover $cover)
    {
        //
    }
}
