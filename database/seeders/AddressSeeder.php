<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::role('user')->get();

        foreach ($clients as $client) {
            Address::create([
                'user_id' => $client->id,
                'type' => 1,
                'description' => fake()->streetAddress(),
                'province' => 'Salta',
                'city' => 'Salta',
                'reference' => 'Domicilio de prueba',
                'receiver' => $client->name . ' ' . $client->last_name,
                'receiver_info' => [
                    'phone' => $client->phone,
                ],
                'default' => true,
            ]);
        }

        $this->command->info('Direcciones de clientes creadas.');
    }
}
