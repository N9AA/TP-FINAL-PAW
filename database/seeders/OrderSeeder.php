<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

class OrderSeeder extends Seeder
{
    private const SHIPPING_COST = 5000;

    public function run(): void
    {
        $clients = User::role('user')
            ->with('addresses')
            ->get()
            ->filter(fn ($user) => $user->addresses->isNotEmpty())
            ->values();

        $variants = Variant::with(['product', 'features'])
            ->whereHas('product')
            ->get();

        if ($clients->isEmpty()) {
            throw new RuntimeException(
                'No hay clientes con direcciones para generar órdenes.'
            );
        }

        if ($variants->isEmpty()) {
            throw new RuntimeException(
                'No hay variantes disponibles para generar órdenes.'
            );
        }

        $statuses = array_merge(
            array_fill(0, 8, OrderStatus::Pending),
            array_fill(0, 8, OrderStatus::Processing),
            array_fill(0, 10, OrderStatus::Shipped),
            array_fill(0, 15, OrderStatus::Completed),
            array_fill(0, 3, OrderStatus::Failed),
            array_fill(0, 3, OrderStatus::Refunded),
            array_fill(0, 3, OrderStatus::Cancelled),
        );

        shuffle($statuses);

        foreach ($statuses as $status) {
            $client = $clients->random();
            $address = $client->addresses->random();

            $selectedVariants = $variants->random(
                min(random_int(1, 3), $variants->count())
            );

            $content = [];
            $subtotal = 0;

            foreach ($selectedVariants as $variant) {
                $product = $variant->product;
                $quantity = random_int(1, 3);
                $price = (float) $product->price;

                $content[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'qty' => $quantity,
                    'price' => $price,
                    'image' => $variant->image,
                    'sku' => $variant->sku,
                    'variant_id' => $variant->id,
                    'features' => $variant->features
                        ->map(fn ($feature) => [
                            'id' => $feature->id,
                            'value' => $feature->value,
                            'description' => $feature->description,
                        ])
                        ->values()
                        ->all(),
                ];

                $subtotal += $price * $quantity;
            }

            $createdAt = fake()->dateTimeBetween(
                '-6 months',
                '-7 days'
            );

            Order::create([
                'user_id' => $client->id,
                'content' => $content,
                'address' => $address->toArray(),
                'payment_method' => 1,
                'payment_id' => 'seed-' . Str::uuid(),
                'total' => round(
                    $subtotal + self::SHIPPING_COST,
                    2
                ),
                'status' => $status,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('50 órdenes de prueba creadas.');
    }
}
