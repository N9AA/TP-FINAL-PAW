<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 4; $i++) {
            $user = User::factory()->create();

            // Reemplazar el rol user por driver.
            $user->syncRoles(['driver']);

            Driver::create([
                'user_id' => $user->id,
                'type' => 1,
                'plate_number' => fake()->unique()->bothify('??###??'),
            ]);
        }

        $this->command->info('Repartidores creados.');
    }
}
