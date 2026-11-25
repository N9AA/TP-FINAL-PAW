<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Models\Driver;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Database\Seeder;

class ShipmentSeeder extends Seeder
{
    public function run(): void
    {
        $drivers = Driver::all();

        if ($drivers->isEmpty()) {
            $this->command->warn(
                'No hay repartidores para asignar envíos.'
            );

            return;
        }

        $orders = Order::whereIn('status', [
            OrderStatus::Shipped,
            OrderStatus::Completed,
            OrderStatus::Failed,
            OrderStatus::Refunded,
        ])->get();

        foreach ($orders as $order) {
            $status = match ($order->status) {
                OrderStatus::Shipped => ShipmentStatus::Pending,
                OrderStatus::Completed => ShipmentStatus::Completed,
                OrderStatus::Failed,
                OrderStatus::Refunded => ShipmentStatus::Failed,
                default => null,
            };

            if (!$status) {
                continue;
            }

            $createdAt = $order->created_at->copy()
                ->addHours(random_int(1, 24));

            if ($createdAt->greaterThan(now())) {
                $createdAt = now();
            }

            $deliveredAt = null;
            $refundedAt = null;

            if ($status === ShipmentStatus::Completed) {
                $deliveredAt = $createdAt->copy()
                    ->addDays(random_int(1, 5));

                if ($deliveredAt->greaterThan(now())) {
                    $deliveredAt = now();
                }
            }

            if ($order->status === OrderStatus::Refunded) {
                $refundedAt = $createdAt->copy();

                if ($refundedAt->greaterThan(now())) {
                    $refundedAt = now();
                }
            }

            Shipment::create([
                'order_id' => $order->id,
                'driver_id' => $drivers->random()->id,
                'status' => $status,
                'delivered_at' => $deliveredAt,
                'refunded_at' => $refundedAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('Envíos de prueba creados.');
    }
}
