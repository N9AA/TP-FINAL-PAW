<?php
namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = trim($request->input('buscar', ''));

        $ordenesPermitidas = ['id', 'cliente', 'total', 'status'];
        $orden = $request->input('orden', 'id');

        if (!in_array($orden, $ordenesPermitidas, true)) {
            $orden = 'id';
        }

        $direccion = $request->input('direccion', 'desc');

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'desc';
        }

        $cantidadesPermitidas = [5, 10, 20];
        $porPagina = (int) $request->input('por_pagina', 10);

        if (!in_array($porPagina, $cantidadesPermitidas, true)) {
            $porPagina = 10;
        }

        $orders = Order::with([
            'user',
            'shipments.driver.user',
        ])
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    if (is_numeric($buscar)) {
                        $q->where('orders.id', (int) $buscar);
                    }

                    $q->orWhereHas('user', function ($userQuery) use ($buscar) {
                        $userQuery->where('name', 'like', "%{$buscar}%");
                    });
                });
            })
            ->when($orden === 'cliente', function ($query) use ($direccion) {
                $query->orderBy(
                    User::select('name')
                        ->whereColumn('users.id', 'orders.user_id'),
                    $direccion
                );
            })
            ->when($orden !== 'cliente', function ($query) use ($orden, $direccion) {
                $query->orderBy("orders.{$orden}", $direccion);
            })
            ->paginate($porPagina)
            ->withQueryString();

        $drivers = Driver::with('user')->get();

        return Inertia::render('admin/orders/Index', [
            'orders' => $orders,
            'drivers' => $drivers,
            'filtros' => [
                'buscar' => $buscar,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
            ],
        ]);
    }

    public function downloadTicket(Order $order)
    {
        abort_unless(
            $order->pdf_path &&
            Storage::disk('public')->exists($order->pdf_path),
            404,
            'El ticket no está disponible.'
        );

        return Storage::disk('public')->download($order->pdf_path);
    }

    public function markAsProcessing(Order $order): RedirectResponse
    {
        if ($order->status !== OrderStatus::Pending) {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'La orden no está pendiente.',
            ]);
        }

        $order->update([
            'status' => OrderStatus::Processing,
        ]);

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'La orden está lista para despachar.',
        ]);
    }

    public function storeShipment(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'driver_id' => ['required', 'exists:drivers,id'],
        ]);

        $assigned = DB::transaction(function () use ($order, $validated) {
            $order = Order::whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->status !== OrderStatus::Processing) {
                return false;
            }

            if ($order->shipments()->exists()) {
                return false;
            }

            $order->shipments()->create([
                'driver_id' => $validated['driver_id'],
            ]);

            $order->update([
                'status' => OrderStatus::Shipped,
            ]);

            return true;
        });

        if (!$assigned) {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'No se puede asignar un conductor a esta orden. Verificá su estado o si ya tiene un envío.',
            ]);
        }

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Conductor asignado correctamente.',
        ]);
    }

    public function markAsRefunded(Order $order): RedirectResponse
    {
        $refunded = DB::transaction(function () use ($order) {
            $order = Order::whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->status !== OrderStatus::Failed) {
                return false;
            }

            $order->update([
                'status' => OrderStatus::Refunded,
            ]);

            $shipment = $order->shipments()->latest()->first();

            if ($shipment) {
                $shipment->update([
                    'refunded_at' => now(),
                ]);
            }

            return true;
        });

        if (!$refunded) {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'La orden no está en estado fallido.',
            ]);
        }

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'La orden fue marcada como devuelta.',
        ]);
    }

    public function cancelOrder(Order $order): RedirectResponse
    {
        $cancelled = DB::transaction(function () use ($order) {
            $order = Order::whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->status === OrderStatus::Cancelled) {
                return 'already_cancelled';
            }

            if (
                $order->shipments()->exists() ||
                in_array($order->status, [
                    OrderStatus::Shipped,
                    OrderStatus::Completed,
                    OrderStatus::Failed,
                    OrderStatus::Refunded,
                ], true)
            ) {
                return 'not_allowed';
            }

            $order->update([
                'status' => OrderStatus::Cancelled,
            ]);

            return 'success';
        });

        if ($cancelled === 'already_cancelled') {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'La orden ya está cancelada.',
            ]);
        }

        if ($cancelled === 'not_allowed') {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => '¡Ups!',
                'text' => 'No se puede cancelar una orden que ya tiene un envío asignado o fue procesada.',
            ]);
        }

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'La orden fue cancelada.',
        ]);
    }
}
