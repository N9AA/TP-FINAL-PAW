<?php
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determina si puede consultar el listado de usuarios.
     */
    public function viewAny(User $currentUser): bool
    {
        return $currentUser->hasRole('admin');
    }

    /**
     * Determina si puede consultar los detalles de un usuario.
     */
    public function view(User $currentUser, User $targetUser): bool
    {
        return $currentUser->hasRole('admin');
    }

    /**
     * Determina si puede acceder a la creación de usuarios.
     */
    public function create(User $currentUser): bool
    {
        return $currentUser->hasRole('admin');
    }

    /**
     * Determina si puede editar otro usuario.
     */
    public function update(User $currentUser, User $targetUser): bool
    {
        return $currentUser->hasRole('admin');
    }

    /**
     * Determina si puede eliminar otro usuario.
     */
    public function delete(User $currentUser, User $targetUser): bool
    {
        // Nadie puede eliminarse a sí mismo.
        if ($currentUser->id === $targetUser->id) {
            return false;
        }

        return $currentUser->hasRole('admin');
    }
}
