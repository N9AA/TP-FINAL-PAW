<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Rol administrador
        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions([
            'access dashboard',
            'manage options',
            'manage families',
            'manage categories',
            'manage subcategories',
            'manage products',
            'manage covers',
            'manage drivers',
            'manage orders',
            'manage shipments',
            'manage roles',
            'manage permissions',
            'manage users',
        ]);

        // Rol repartidor
        $driver = Role::firstOrCreate([
            'name' => 'driver',
            'guard_name' => 'web',
        ]);

        $driver->syncPermissions([
            'access dashboard',
            'manage shipments',
            'update shipments',
        ]);

        // Rol cliente registrado
        Role::firstOrCreate([
            'name' => 'user',
            'guard_name' => 'web',
        ]);

        // Limpiar nuevamente la caché
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
