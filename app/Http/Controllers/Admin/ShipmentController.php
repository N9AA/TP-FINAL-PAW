<?php
namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'status' => ['nullable', 'integer', 'in:1,2,3'],
        ]);

        $buscar = trim($request->input('buscar', ''));

        // Columnas permitidas para ordenar
        $orden = $request->input('orden', 'id');

        if (!in_array($orden, [
            'id',
            'order_id',
            'cliente',
            'conductor',
            'patente',
            'status',
        ], true)) {
            $orden = 'id';
        }

        // Dirección permitida
        $direccion = $request->input('direccion', 'desc');

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'desc';
        }

        // Cantidad de registros por página
        $porPagina = $request->input('por_pagina', 10);

        if (!in_array((int) $porPagina, [5, 10, 20], true)) {
            $porPagina = 10;
        }

        $porPagina = (int) $porPagina;

        $status = $request->input('status');

        // Consulta de envíos
        $query = Shipment::query()
            ->with([
                'order.user',
                'driver.user',
            ]);

        // Si es driver, solamente ve sus envíos asignados
        if ($request->user()->hasRole('driver')) {
            $driverId = Driver::where(
                'user_id',
                $request->user()->id
            )->value('id');

            $query->where('driver_id', $driverId ?? 0);
        }

        $shipments = $query
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('shipments.status', (int) $status);
            })
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    if (is_numeric($buscar)) {
                        $q->orWhere('shipments.id', (int) $buscar)
                            ->orWhere('shipments.order_id', (int) $buscar);
                    }

                    $q->orWhereHas('order.user', function ($userQuery) use ($buscar) {
                        $userQuery->where('name', 'like', "%{$buscar}%");
                    });

                    $q->orWhereHas('driver.user', function ($userQuery) use ($buscar) {
                        $userQuery->where('name', 'like', "%{$buscar}%");
                    });

                    $q->orWhereHas('driver', function ($driverQuery) use ($buscar) {
                        $driverQuery->where('plate_number', 'like', "%{$buscar}%");
                    });
                });
            })
            ->when($orden === 'cliente', function ($query) use ($direccion) {
                $query->orderBy(
                    Order::query()
                        ->select('users.name')
                        ->join('users', 'users.id', '=', 'orders.user_id')
                        ->whereColumn('orders.id', 'shipments.order_id'),
                    $direccion
                );
            })
            ->when($orden === 'conductor', function ($query) use ($direccion) {
                $query->orderBy(
                    Driver::query()
                        ->select('users.name')
                        ->join('users', 'users.id', '=', 'drivers.user_id')
                        ->whereColumn('drivers.id', 'shipments.driver_id'),
                    $direccion
                );
            })
            ->when($orden === 'patente', function ($query) use ($direccion) {
                $query->orderBy(
                    Driver::query()
                        ->select('plate_number')
                        ->whereColumn('drivers.id', 'shipments.driver_id'),
                    $direccion
                );
            })
            ->when(
                in_array($orden, ['id', 'order_id', 'status'], true),
                function ($query) use ($orden, $direccion) {
                    $query->orderBy('shipments.' . $orden, $direccion);
                }
            )
            ->paginate($porPagina)
            ->withQueryString();

        return Inertia::render('admin/shipments/Index', [
            'shipments' => $shipments,
            'filtros' => [
                'buscar' => $buscar,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
                'status' => $status,
            ],
        ]);
    }

    public function markAsCompleted(Shipment $shipment): RedirectResponse
    {
        // Solamente quien tiene el permiso puede actualizar el estado
        abort_unless(auth()->user()->can('update shipments'), 403);

        return DB::transaction(function () use ($shipment) {
            $driverId = Driver::where(
                'user_id',
                auth()->id()
            )->value('id');

            abort_if(!$driverId, 403);

            // Verificar que el envío pertenezca al driver
            $shipment = Shipment::whereKey($shipment->id)
                ->where('driver_id', $driverId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($shipment->status !== ShipmentStatus::Pending) {
                return back()->with('swal', [
                    'icon' => 'error',
                    'title' => '¡Ups!',
                    'text' => 'Este envío ya fue procesado.',
                ]);
            }

            $shipment->update([
                'status' => ShipmentStatus::Completed,
                'delivered_at' => now(),
            ]);

            $shipment->order()->update([
                'status' => OrderStatus::Completed,
            ]);

            return back()->with('swal', [
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'El envío fue marcado como entregado.',
            ]);
        });
    }

    public function markAsFailed(Shipment $shipment): RedirectResponse
    {
        // Solamente quien tiene el permiso puede actualizar el estado
        abort_unless(auth()->user()->can('update shipments'), 403);

        return DB::transaction(function () use ($shipment) {
            $driverId = Driver::where(
                'user_id',
                auth()->id()
            )->value('id');

            abort_if(!$driverId, 403);

            // Verificar que el envío pertenezca al driver
            $shipment = Shipment::whereKey($shipment->id)
                ->where('driver_id', $driverId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($shipment->status !== ShipmentStatus::Pending) {
                return back()->with('swal', [
                    'icon' => 'error',
                    'title' => '¡Ups!',
                    'text' => 'Este envío ya fue procesado.',
                ]);
            }

            $shipment->update([
                'status' => ShipmentStatus::Failed,
            ]);

            $shipment->order()->update([
                'status' => OrderStatus::Failed,
            ]);

            return back()->with('swal', [
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'El envío fue marcado como fallido.',
            ]);
        });
    }
}
