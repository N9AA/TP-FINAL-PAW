<?php
namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    public function generate(Request $request)
    {
        $period = $request->query('period', 'month');

        if (!in_array($period, ['today', 'week', 'month', 'year'], true)) {
            $period = 'month';
        }

        $now = Carbon::now();

        switch ($period) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $periodLabel = 'Hoy';
                break;

            case 'week':
                $startDate = $now->copy()->startOfWeek(CarbonInterface::MONDAY);
                $endDate = $now->copy()->endOfWeek(CarbonInterface::SUNDAY);
                $periodLabel = 'Esta semana';
                break;

            case 'year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                $periodLabel = 'Este año';
                break;

            default:
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                $periodLabel = 'Este mes';
                break;
        }

        $confirmedStatuses = [
            OrderStatus::Processing->value,
            OrderStatus::Shipped->value,
            OrderStatus::Completed->value,
        ];

        // Pedidos recibidos durante el período seleccionado.
        $orders = Order::whereBetween('created_at', [
            $startDate,
            $endDate,
        ])->get();

        // Consideramos ventas confirmadas las que están en preparación,
        // enviadas o completadas.
        $salesOrders = $orders->filter(function ($order) use ($confirmedStatuses) {
            return in_array(
                (int) $order->getRawOriginal('status'),
                $confirmedStatuses,
                true
            );
        });

        $totalOrders = $orders->count();
        $totalSales = $salesOrders->sum('total');
        $salesCount = $salesOrders->count();

        $averageTicket = $salesCount > 0
            ? $totalSales / $salesCount
            : 0;

        // Obtenemos los ID de las variantes vendidas.
        $variantIds = collect();

        foreach ($salesOrders as $order) {
            foreach ($this->getOrderItems($order) as $item) {
                if (!empty($item['variant_id'])) {
                    $variantIds->push((int) $item['variant_id']);
                }
            }
        }

        // Relacionamos variantes, productos y categorías.
        $variants = DB::table('variants')
            ->join('products', 'products.id', '=', 'variants.product_id')
            ->join('subcategories', 'subcategories.id', '=', 'products.subcategory_id')
            ->join('categories', 'categories.id', '=', 'subcategories.category_id')
            ->whereIn('variants.id', $variantIds->unique())
            ->select([
                'variants.id as variant_id',
                'products.id as product_id',
                'products.name as product_name',
                'categories.id as category_id',
                'categories.name as category_name',
            ])
            ->get()
            ->keyBy('variant_id');

        $productsSales = [];
        $categoriesSales = [];

        foreach ($salesOrders as $order) {
            foreach ($this->getOrderItems($order) as $item) {
                $quantity = (int) ($item['qty'] ?? 0);
                $price = (float) ($item['price'] ?? 0);

                if ($quantity <= 0) {
                    continue;
                }

                $subtotal = $quantity * $price;

                $variant = $variants->get(
                    (int) ($item['variant_id'] ?? 0)
                );

                $productName = $variant?->product_name
                    ?? ($item['name'] ?? 'Producto sin nombre');

                $productKey = $variant
                    ? 'product_' . $variant->product_id
                    : 'name_' . mb_strtolower($productName);

                if (!isset($productsSales[$productKey])) {
                    $productsSales[$productKey] = [
                        'name' => $productName,
                        'quantity' => 0,
                        'total' => 0,
                    ];
                }

                $productsSales[$productKey]['quantity'] += $quantity;
                $productsSales[$productKey]['total'] += $subtotal;

                $categoryName = $variant?->category_name ?? 'Sin categoría';

                $categoryKey = $variant
                    ? 'category_' . $variant->category_id
                    : 'sin_categoria';

                if (!isset($categoriesSales[$categoryKey])) {
                    $categoriesSales[$categoryKey] = [
                        'name' => $categoryName,
                        'total' => 0,
                    ];
                }

                $categoriesSales[$categoryKey]['total'] += $subtotal;
            }
        }

        // Los cinco productos con más unidades vendidas.
        $topProducts = collect($productsSales)
            ->sortByDesc('quantity')
            ->take(5)
            ->values();

        // Ventas agrupadas por categoría.
        $salesByCategory = collect($categoriesSales)
            ->sortByDesc('total')
            ->values();

        // Cantidad de pedidos por estado.
        $statusLabels = [
            1 => 'Pendiente',
            2 => 'En preparación',
            3 => 'Enviado',
            4 => 'Completado',
            5 => 'Fallido',
            6 => 'Reembolsado',
            7 => 'Cancelado',
        ];

        $ordersByStatus = collect($statusLabels)->map(
            function ($label, $status) use ($orders) {
                return [
                    'status' => $label,
                    'quantity' => $orders->filter(function ($order) use ($status) {
                        return (int) $order->getRawOriginal('status') === $status;
                    })->count(),
                ];
            }
        )->values();

        // Generación del PDF.
        $pdf = Pdf::loadView('reports.sales', [
            'periodLabel' => $periodLabel,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
            'totalOrders' => $totalOrders,
            'totalSales' => $totalSales,
            'salesCount' => $salesCount,
            'averageTicket' => $averageTicket,
            'topProducts' => $topProducts,
            'salesByCategory' => $salesByCategory,
            'ordersByStatus' => $ordersByStatus,
        ]);

        return $pdf->setPaper('a4', 'portrait')
            ->download('reporte-ventas-' . $period . '.pdf');
    }

    private function getOrderItems(Order $order): array
    {
        $content = $order->content;

        if (is_string($content)) {
            $content = json_decode($content, true);
        }

        return is_array($content) ? $content : [];
    }
}
