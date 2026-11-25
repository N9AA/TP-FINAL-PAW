<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Enums\TypeOfDocuments;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('admin/users/Index', [
            'users' => User::with('roles:id,name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('admin/users/Create', [
            'roles' => Role::get(['id', 'name']),
            'documentTypes' => collect(TypeOfDocuments::cases())->map(fn ($type) => [
                'value' => (string) $type->value,
                'name' => $type->name,
            ]),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validated();

        $roles = $validated['roles'] ?? [];

        unset($validated['roles']);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        $user->syncRoles($roles);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function show(User $user): Response
    {
        Gate::authorize('view', $user);

        return Inertia::render('admin/users/Show', [
            'user' => $user->load('roles:id,name'),
            'permissions' => $user->getAllPermissions()->map(fn ($perm) => [
                'id' => $perm->id,
                'name' => $perm->name,
            ]),
        ]);
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('admin/users/Edit', [
            'user' => $user->only([
                'id',
                'name',
                'last_name',
                'document_type',
                'document',
                'email',
                'phone',
            ]),
            'roles' => Role::get(['id', 'name']),
            'userRoles' => $user->roles->pluck('name'),
            'documentTypes' => collect(TypeOfDocuments::cases())->map(fn ($type) => [
                'value' => (string) $type->value,
                'name' => $type->name,
            ]),
        ]);
    }

    public function update(
        UpdateUserRequest $request,
        User $user
    ): RedirectResponse {
        Gate::authorize('update', $user);

        $validated = $request->validated();

        // Evitar que un administrador se quite a sí mismo el rol admin.
        if (
            $request->user()->id === $user->id &&
            $user->hasRole('admin') &&
            array_key_exists('roles', $validated) &&
            !in_array('admin', $validated['roles'] ?? [])
        ) {
            return redirect()->back()
                ->withErrors([
                    'roles' => 'No puedes quitarte a ti mismo el rol de administrador.',
                ])
                ->withInput();
        }

        // Actualizar la contraseña solamente si se ingresó una nueva.
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Guardar los datos del usuario.
        $user->update(
            collect($validated)->except('roles')->all()
        );

        // Sincronizar roles solamente si fueron enviados.
        if (array_key_exists('roles', $validated)) {
            $user->syncRoles($validated['roles'] ?? []);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario eliminado correctamente.');
    }
}
