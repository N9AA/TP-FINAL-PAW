<?php
namespace Database\Seeders;

use App\Models\Cover;
use Illuminate\Database\Seeder;

class CoverSeeder extends Seeder
{
    public function run(): void
    {
        $covers = [
            [
                'title' => 'Black Friday',
                'image_path' => 'covers/black-friday.jpg',
                'start_at' => '2026-11-25 00:00:00',
                'end_at' => '2026-11-30 23:59:59',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'title' => 'Navidad con Meraki',
                'image_path' => 'covers/navidad.jpg',
                'start_at' => '2026-11-25 00:00:00',
                'end_at' => '2026-12-25 23:59:59',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'title' => 'Organizá tu 2027',
                'image_path' => 'covers/organiza-2027.jpg',
                'start_at' => '2026-11-25 00:00:00',
                'end_at' => '2027-01-15 23:59:59',
                'is_active' => true,
                'order' => 3,
            ],
        ];

        foreach ($covers as $cover) {
            Cover::updateOrCreate(
                ['title' => $cover['title']],
                $cover
            );
        }

        $this->command->info('Portadas promocionales creadas correctamente.');
    }
}
