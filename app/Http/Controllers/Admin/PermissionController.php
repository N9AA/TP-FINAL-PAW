<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/permissions/Index', [
            'permissions' => Permission::get([
                'id',
                'name',
                'guard_name',
                'created_at',
            ]),
        ]);
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $validated['guard_name'] = $validated['guard_name'] ?? 'web';

        Permission::create($validated);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permiso creado correctamente.');
    }

    public function update(
        UpdatePermissionRequest $request,
        Permission $permission
    ): RedirectResponse {
        $validated = $request->validated();

        $permission->update($validated);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permiso actualizado correctamente.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permiso eliminado correctamente.');
    }
}