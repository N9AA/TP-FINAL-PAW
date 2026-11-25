<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Crear permisos, familias, opciones y roles.
        $this->call([
            PermissionSeeder::class,
            FamilySeeder::class,
            OptionSeeder::class,
            RoleSeeder::class,
        ]);

        // Crear administrador.
        $admin = User::factory()->create([
            'name' => 'Alejandra',
            'last_name' => 'Abcdefg',
            'document_type' => '1',
            'document' => '12345678',
            'email' => 'alejandra@gmail.com',
            'phone' => '12345678',
            'password' => bcrypt('12345678'),
        ]);

        $admin->syncRoles(['admin']);

        // Crear 20 usuarios de prueba.
        User::factory(20)->create();

        $this->command->info('Usuarios creados correctamente.');

        // Crear direcciones y repartidores.
        $this->call([
            AddressSeeder::class,
            DriverSeeder::class,
        ]);

        // Crear productos, opciones y variantes.
        $this->call([
            ProductSeeder::class,
        ]);

        // Crear órdenes y envíos de prueba.
        $this->call([
            OrderSeeder::class,
            ShipmentSeeder::class,
        ]);

        // Crear portadas promocionales.
        $this->call([
            CoverSeeder::class,
        ]);

        $this->command->info('Datos de prueba generados correctamente.');
    }
}
