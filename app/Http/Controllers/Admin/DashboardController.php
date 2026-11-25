<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'month');

        if (!in_array($period, ['today', 'week', 'month', 'year'], true)) {
            $period = 'month';
        }

        $now = now();

        [$startDate, $endDate] = match ($period) {
            'today' => [
                $now->copy()->startOfDay(),
                $now->copy()->endOfDay(),
            ],
            'week' => [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
            ],
            'year' => [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
            ],
            default => [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
            ],
        };

        // Estados que representan ventas confirmadas.
        $salesStatuses = [
            OrderStatus::Processing->value,
            OrderStatus::Shipped->value,
            OrderStatus::Completed->value,
        ];

        // Pedidos del período seleccionado.
        $ordersQuery = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalOrders = (clone $ordersQuery)->count();

        // Pedidos que cuentan como ventas.
        $salesOrdersQuery = (clone $ordersQuery)
            ->whereIn('status', $salesStatuses);

        $totalSales = (clone $salesOrdersQuery)->sum('total');
        $salesOrdersCount = (clone $salesOrdersQuery)->count();

        $averageTicket = $salesOrdersCount > 0
            ? $totalSales / $salesOrdersCount
            : 0;

        // Clientes y productos registrados.
        $totalCustomers = User::role('user')->count();
        $totalProducts = Product::count();

        // Gráfico de evolución de ventas.
        $salesForChart = (clone $salesOrdersQuery)
            ->get(['created_at', 'total']);

        $salesChart = $this->buildSalesChart(
            $salesForChart,
            $startDate,
            $endDate,
            $period
        );

        // Pedidos según su estado.
        $ordersByStatus = (clone $ordersQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(function ($order) {
                $status = $order->status instanceof OrderStatus
                    ? $order->status->value
                    : (int) $order->status;

                return [
                    'status' => $status,
                    'label' => $this->getOrderStatusLabel($status),
                    'total' => (int) $order->total,
                ];
            })
            ->values();

        // Productos más vendidos.
        $topProducts = $this->getTopProducts(
            $startDate,
            $endDate,
            $salesStatuses
        );

        // Ventas agrupadas por categoría.
        $salesByCategory = $this->getSalesByCategory(
            $startDate,
            $endDate,
            $salesStatuses
        );

        // Top 5 clientes por dinero gastado.
        $topCustomers = $this->getTopCustomers(
            $startDate,
            $endDate,
            $salesStatuses
        );

        // Nuevos clientes registrados durante el período.
        $newCustomers = User::role('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Evolución de registros de clientes.
        $customersForChart = User::role('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get(['created_at']);

        $customersChart = $this->buildCountChart(
            $customersForChart,
            $startDate,
            $endDate,
            $period
        );

        // Productos con poco stock.
        // El inventario siempre muestra el estado actual.
        $lowStockProducts = DB::table('variants')
            ->join('products', 'products.id', '=', 'variants.product_id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('COALESCE(SUM(variants.stock), 0) as stock')
            )
            ->groupBy('products.id', 'products.name')
            ->havingRaw('COALESCE(SUM(variants.stock), 0) <= ?', [5])
            ->orderBy('stock')
            ->limit(8)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'stock' => (int) $product->stock,
            ]);

        // Últimos pedidos registrados.
        $recentOrders = Order::query()
            ->with('user:id,name')
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($order) {
                $status = $order->status instanceof OrderStatus
                    ? $order->status->value
                    : (int) $order->getRawOriginal('status');

                return [
                    'id' => $order->id,
                    'customer' => $order->user?->name ?? 'Cliente',
                    'total' => (float) $order->total,
                    'status' => $status,
                    'statusLabel' => $this->getOrderStatusLabel($status),
                    'createdAt' => $order->created_at?->toDateTimeString(),
                ];
            });

        // Estadísticas de envíos.
        $shipmentsQuery = Shipment::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalShipments = (clone $shipmentsQuery)->count();

        $completedShipments = (clone $shipmentsQuery)
            ->where('status', 2)
            ->count();

        $pendingShipments = (clone $shipmentsQuery)
            ->where('status', 1)
            ->count();

        $failedShipments = (clone $shipmentsQuery)
            ->where('status', 3)
            ->count();

        $deliveryRate = $totalShipments > 0
            ? round(($completedShipments / $totalShipments) * 100, 2)
            : 0;

        return Inertia::render('admin/Dashboard', [
            'filters' => [
                'period' => $period,
                'startDate' => $startDate->toDateString(),
                'endDate' => $endDate->toDateString(),
            ],

            'stats' => [
                'sales' => (float) $totalSales,
                'totalOrders' => $totalOrders,
                'salesOrders' => $salesOrdersCount,
                'averageTicket' => round($averageTicket, 2),
                'totalCustomers' => $totalCustomers,
                'newCustomers' => $newCustomers,
                'totalProducts' => $totalProducts,
                'totalShipments' => $totalShipments,
                'completedShipments' => $completedShipments,
                'pendingShipments' => $pendingShipments,
                'failedShipments' => $failedShipments,
                'deliveryRate' => $deliveryRate,
            ],

            'salesChart' => $salesChart,
            'ordersByStatus' => $ordersByStatus,
            'topProducts' => $topProducts,
            'salesByCategory' => $salesByCategory,
            'topCustomers' => $topCustomers,
            'customersChart' => $customersChart,
            'lowStockProducts' => $lowStockProducts,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Construye los datos del gráfico de ventas.
     */
    private function buildSalesChart(
        $orders,
        CarbonInterface $startDate,
        CarbonInterface $endDate,
        string $period
    ): array {
        $groupByMonth = $period === 'year';

        $salesByDate = $orders
            ->groupBy(function ($order) use ($groupByMonth) {
                $date = Carbon::parse($order->created_at);

                return $groupByMonth
                    ? $date->format('Y-m')
                    : $date->format('Y-m-d');
            })
            ->map(fn ($items) => $items->sum('total'));

        $result = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $key = $groupByMonth
                ? $current->format('Y-m')
                : $current->format('Y-m-d');

            $label = $groupByMonth
                ? $this->getMonthLabel((int) $current->format('n'))
                : $current->format('d/m');

            $result[] = [
                'label' => $label,
                'sales' => round((float) ($salesByDate[$key] ?? 0), 2),
            ];

            // CarbonImmutable devuelve una nueva instancia.
            $current = $groupByMonth
                ? $current->addMonth()
                : $current->addDay();
        }

        return $result;
    }

    /**
     * Construye los datos del gráfico de nuevos clientes.
     */
    private function buildCountChart(
        $records,
        CarbonInterface $startDate,
        CarbonInterface $endDate,
        string $period
    ): array {
        $groupByMonth = $period === 'year';

        $countsByDate = $records
            ->groupBy(function ($record) use ($groupByMonth) {
                $date = Carbon::parse($record->created_at);

                return $groupByMonth
                    ? $date->format('Y-m')
                    : $date->format('Y-m-d');
            })
            ->map(fn ($items) => $items->count());

        $result = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $key = $groupByMonth
                ? $current->format('Y-m')
                : $current->format('Y-m-d');

            $label = $groupByMonth
                ? $this->getMonthLabel((int) $current->format('n'))
                : $current->format('d/m');

            $result[] = [
                'label' => $label,
                'customers' => (int) ($countsByDate[$key] ?? 0),
            ];

            $current = $groupByMonth
                ? $current->addMonth()
                : $current->addDay();
        }

        return $result;
    }

    /**
     * Obtiene los productos más vendidos desde el JSON content.
     */
    private function getTopProducts(
        CarbonInterface $startDate,
        CarbonInterface $endDate,
        array $salesStatuses
    ): array {
        $orders = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', $salesStatuses)
            ->get(['content']);

        $products = [];

        foreach ($orders as $order) {
            $items = $order->content ?? [];

            if (!is_array($items)) {
                continue;
            }

            foreach ($items as $item) {
                if (!is_array($item)) {
                    continue;
                }

                $id = $item['id'] ?? null;
                $name = $item['name'] ?? 'Producto sin nombre';
                $quantity = (int) ($item['qty'] ?? 0);

                if (!$id || $quantity <= 0) {
                    continue;
                }

                if (!isset($products[$id])) {
                    $products[$id] = [
                        'id' => $id,
                        'name' => $name,
                        'quantity' => 0,
                        'revenue' => 0,
                    ];
                }

                $products[$id]['quantity'] += $quantity;
                $products[$id]['revenue'] +=
                    $quantity * (float) ($item['price'] ?? 0);
            }
        }

        return collect($products)
            ->sortByDesc('quantity')
            ->take(5)
            ->values()
            ->map(fn ($product) => [
                ...$product,
                'revenue' => round($product['revenue'], 2),
            ])
            ->all();
    }

    /**
     * Calcula las ventas por categoría usando la relación:
     * Product -> Subcategory -> Category.
     */
    private function getSalesByCategory(
        CarbonInterface $startDate,
        CarbonInterface $endDate,
        array $salesStatuses
    ): array {
        $orders = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', $salesStatuses)
            ->get(['content']);

        $itemsByProduct = [];
        $productIds = [];

        foreach ($orders as $order) {
            $items = $order->content ?? [];

            if (!is_array($items)) {
                continue;
            }

            foreach ($items as $item) {
                if (!is_array($item)) {
                    continue;
                }

                $productId = $item['id'] ?? null;
                $quantity = (int) ($item['qty'] ?? 0);

                if (!$productId || $quantity <= 0) {
                    continue;
                }

                $productIds[] = $productId;

                if (!isset($itemsByProduct[$productId])) {
                    $itemsByProduct[$productId] = [
                        'revenue' => 0,
                    ];
                }

                $itemsByProduct[$productId]['revenue'] +=
                    $quantity * (float) ($item['price'] ?? 0);
            }
        }

        if (empty($productIds)) {
            return [];
        }

        $products = Product::query()
            ->with('subcategory.category')
            ->whereIn('id', array_unique($productIds))
            ->get()
            ->keyBy('id');

        $categories = [];

        foreach ($itemsByProduct as $productId => $itemData) {
            $product = $products->get($productId);

            $category = $product?->subcategory?->category;

            $categoryId = $category?->id ?? 'uncategorized';
            $categoryName = $category?->name ?? 'Sin categoría';

            if (!isset($categories[$categoryId])) {
                $categories[$categoryId] = [
                    'id' => $categoryId,
                    'name' => $categoryName,
                    'revenue' => 0,
                ];
            }

            $categories[$categoryId]['revenue'] += $itemData['revenue'];
        }

        return collect($categories)
            ->sortByDesc('revenue')
            ->values()
            ->map(fn ($category) => [
                ...$category,
                'revenue' => round($category['revenue'], 2),
            ])
            ->all();
    }

    /**
     * Obtiene los cinco clientes que más dinero gastaron.
     */
    private function getTopCustomers(
        CarbonInterface $startDate,
        CarbonInterface $endDate,
        array $salesStatuses
    ): array {
        return Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', $salesStatuses)
            ->whereNotNull('user_id')
            ->whereHas('user', fn ($query) => $query->role('user'))
            ->select(
                'user_id',
                DB::raw('SUM(total) as total_spent'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->with('user:id,name')
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->limit(5)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->user_id,
                'name' => $order->user?->name ?? 'Cliente',
                'totalSpent' => round((float) $order->total_spent, 2),
                'ordersCount' => (int) $order->orders_count,
            ])
            ->values()
            ->all();
    }

    /**
     * Devuelve el nombre del estado de un pedido.
     */
    private function getOrderStatusLabel(int $status): string
    {
        return match ($status) {
            1 => 'Pendiente',
            2 => 'En preparación',
            3 => 'Enviado',
            4 => 'Completado',
            5 => 'Fallido',
            6 => 'Reembolsado',
            7 => 'Cancelado',
            default => 'Desconocido',
        };
    }

    /**
     * Devuelve la abreviatura del mes.
     */
    private function getMonthLabel(int $month): string
    {
        return [
            1 => 'Ene',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Abr',
            5 => 'May',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Ago',
            9 => 'Sep',
            10 => 'Oct',
            11 => 'Nov',
            12 => 'Dic',
        ][$month];
    }
}
