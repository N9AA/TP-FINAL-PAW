
import AdminLayout from '@/layouts/admin-layout';

import { Head, router, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    Truck,
    ClipboardList,
    LogOut,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    UserPlus,
    Crown,
    ChartNoAxesCombined,
    FileDown,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

interface DashboardProps extends SharedData {
    filters: {
        period: string;
        startDate: string;
        endDate: string;
    };

    stats: {
        sales: number;
        totalOrders: number;
        salesOrders: number;
        averageTicket: number;
        totalCustomers: number;
        newCustomers: number;
        totalProducts: number;
        totalShipments: number;
        completedShipments: number;
        pendingShipments: number;
        failedShipments: number;
        deliveryRate: number;
    };

    salesChart: {
        label: string;
        sales: number;
    }[];

    customersChart: {
        label: string;
        customers: number;
    }[];

    ordersByStatus: {
        status: number;
        label: string;
        total: number;
    }[];

    salesByCategory: {
        id: number | string;
        name: string;
        revenue: number;
    }[];

    topCustomers: {
        id: number;
        name: string;
        totalSpent: number;
        ordersCount: number;
    }[];

    topProducts: {
        id: number;
        name: string;
        quantity: number;
        revenue: number;
    }[];

    lowStockProducts: {
        id: number;
        name: string;
        stock: number;
    }[];

    recentOrders: {
        id: number;
        customer: string;
        total: number;
        status: number;
        statusLabel: string;
        createdAt: string | null;
    }[];
}

// -----------------------------------------------------------------------------
// CONFIGURACIÓN
// -----------------------------------------------------------------------------

const PIE_COLORS = [
    '#8C5770',
    '#D5C5D9',
    '#C28DA6',
    '#F2BFBD',
    '#A77A91',
    '#E6A9B7',
    '#B9A2BC',
    '#A3B8A8',
    '#E8C987',
    '#91B7C7',
    '#D69A78',
    '#9B91BD',
    '#B7C9A8',
    '#E6B7C8',
    '#7FA6A0',
    '#C4A17B',
    '#A6A1C9',
    '#D98F8F',
    '#8FA8C9',
    '#C5B58A',
    '#B18BA8',
    '#A5C4B5',
    '#E2A878',
    '#8996B0',
];

// Asignar un color estable a cada categoría según su ID.
const getCategoryColor = (categoryId: number | string) => {
    let hash = 0;

    for (const char of String(categoryId)) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }

    return PIE_COLORS[hash % PIE_COLORS.length];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2,
    }).format(value);

const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)} M`;
    }

    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)} mil`;
    }

    return `$${value}`;
};

const formatDate = (value: string | null) => {
    if (!value) return 'Sin fecha';

    return new Date(value.replace(' ', 'T')).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const getStatusVariant = (
    status: number,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 1:
            return 'secondary';
        case 2:
            return 'outline';
        case 3:
        case 4:
            return 'default';
        case 5:
        case 7:
            return 'destructive';
        case 6:
            return 'secondary';
        default:
            return 'outline';
    }
};

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------

export default function Dashboard() {
    const {
        auth,
        filters,
        stats,
        salesChart,
        customersChart,
        ordersByStatus,
        salesByCategory,
        topCustomers,
        topProducts,
        lowStockProducts,
        recentOrders,
    } = usePage<DashboardProps>().props;

    const user = auth.user;

    if (!user) {
        return null;
    }

    const changePeriod = (period: string) => {
        router.get(
            '/admin',
            { period },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const shipmentPercentage = Math.min(
        Math.max(stats.deliveryRate, 0),
        100,
    );

    const cardStyle =
        'rounded-xl border-[#E8DDE6] bg-white shadow-sm transition-shadow hover:shadow-md';

    const chartStyle = {
        borderRadius: '10px',
        border: '1px solid #E8DDE6',
        backgroundColor: '#FFFFFF',
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                },
            ]}
        >
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6">

                {/* ENCABEZADO */}
                <div className="flex flex-col gap-4 rounded-xl border border-[#E8DDE6] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            className="h-14 w-14 rounded-full border-2 border-[#D5C5D9] object-cover p-0.5"
                            src={user.profile_photo_url ?? ''}
                            alt={user.name}
                        />

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-[#5F3B50]">
                                ¡Hola, {user.name}!
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Bienvenido al panel de administración de Meraki.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="border-[#E8DDE6] text-[#8C5770] hover:bg-[#FAF7F9] hover:text-[#75465C]"
                        onClick={() => router.post('/logout')}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </div>

                {/* TÍTULO, FILTRO Y REPORTE PDF */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-[#5F3B50]">
                            Resumen de tu tienda
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Indicadores y actividad de tu ecommerce.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                            value={filters.period}
                            onValueChange={changePeriod}
                        >
                            <SelectTrigger className="w-full border-[#E8DDE6] bg-white sm:w-[190px]">
                                <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="today">Hoy</SelectItem>
                                <SelectItem value="week">Esta semana</SelectItem>
                                <SelectItem value="month">Este mes</SelectItem>
                                <SelectItem value="year">Este año</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            asChild
                            className="bg-[#8C5770] text-white hover:bg-[#75465C]"
                        >
                            <a href={`/admin/reports/sales?period=${filters.period}`}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Descargar reporte PDF
                            </a>
                        </Button>
                    </div>
                </div>

                {/* TARJETAS DE MÉTRICAS */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    <Card className={cardStyle}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Ventas confirmadas
                            </CardTitle>
                            <div className="rounded-lg bg-[#F5ECF2] p-2">
                                <DollarSign className="h-4 w-4 text-[#8C5770]" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold text-[#5F3B50]">
                                {formatCurrency(stats.sales)}
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                <TrendingUp className="mr-1 inline h-3 w-3 text-[#8C5770]" />
                                {stats.salesOrders} pedidos con venta confirmada
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={cardStyle}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pedidos recibidos
                            </CardTitle>
                            <div className="rounded-lg bg-[#F5ECF2] p-2">
                                <ShoppingBag className="h-4 w-4 text-[#8C5770]" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold text-[#5F3B50]">
                                {stats.totalOrders}
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Pedidos registrados en el período
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={cardStyle}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Ticket promedio
                            </CardTitle>
                            <div className="rounded-lg bg-[#F5ECF2] p-2">
                                <ClipboardList className="h-4 w-4 text-[#8C5770]" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold text-[#5F3B50]">
                                {formatCurrency(stats.averageTicket)}
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Importe promedio por venta confirmada
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={cardStyle}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Clientes registrados
                            </CardTitle>
                            <div className="rounded-lg bg-[#F5ECF2] p-2">
                                <Users className="h-4 w-4 text-[#8C5770]" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold text-[#5F3B50]">
                                {stats.totalCustomers}
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Total de cuentas de clientes
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={cardStyle}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Productos
                            </CardTitle>
                            <div className="rounded-lg bg-[#F5ECF2] p-2">
                                <Package className="h-4 w-4 text-[#8C5770]" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold text-[#5F3B50]">
                                {stats.totalProducts}
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Productos registrados en el catálogo
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={cardStyle}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Envíos completados
                            </CardTitle>
                            <div className="rounded-lg bg-[#F5ECF2] p-2">
                                <Truck className="h-4 w-4 text-[#8C5770]" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold text-[#5F3B50]">
                                {stats.completedShipments}
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                De {stats.totalShipments} envíos del período
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* GRÁFICOS PRINCIPALES */}
                <div className="grid gap-4 lg:grid-cols-7">

                    {/* EVOLUCIÓN DE VENTAS */}
                    <Card className={`${cardStyle} lg:col-span-4`}>
                        <CardHeader>
                            <CardTitle className="text-[#5F3B50]">
                                Evolución de ventas
                            </CardTitle>

                            <CardDescription>
                                Comportamiento de las ventas confirmadas durante el período.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="h-[310px] w-full">
                                {salesChart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={salesChart}
                                            margin={{
                                                top: 10,
                                                right: 15,
                                                left: 10,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#E8DDE6"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={12}
                                                minTickGap={15}
                                                tick={{ fill: '#8B7A84' }}
                                            />

                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                tick={{ fill: '#8B7A84' }}
                                                tickFormatter={formatCompactCurrency}
                                            />

                                            <Tooltip
                                                formatter={(value) => [
                                                    formatCurrency(Number(value)),
                                                    'Ventas',
                                                ]}
                                                contentStyle={chartStyle}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="sales"
                                                name="Ventas"
                                                stroke="#8C5770"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{
                                                    r: 6,
                                                    fill: '#8C5770',
                                                    stroke: '#FFFFFF',
                                                    strokeWidth: 2,
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        No hay datos de ventas para mostrar.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* PEDIDOS POR ESTADO: DONA */}
                    <Card className={`${cardStyle} lg:col-span-3`}>
                        <CardHeader>
                            <CardTitle className="text-[#5F3B50]">
                                Pedidos por estado
                            </CardTitle>

                            <CardDescription>
                                Distribución de pedidos según su situación.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="h-[310px] w-full">
                                {ordersByStatus.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={ordersByStatus}
                                                dataKey="total"
                                                nameKey="label"
                                                cx="50%"
                                                cy="43%"
                                                innerRadius={58}
                                                outerRadius={95}
                                                paddingAngle={3}
                                            >
                                                {ordersByStatus.map((entry, index) => (
                                                    <Cell
                                                        key={entry.status}
                                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value, name) => [
                                                    value,
                                                    name,
                                                ]}
                                                contentStyle={chartStyle}
                                            />

                                            <Legend
                                                verticalAlign="bottom"
                                                height={55}
                                                iconType="circle"
                                                wrapperStyle={{
                                                    fontSize: '12px',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        No hay pedidos para mostrar.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* VENTAS POR CATEGORÍA Y NUEVOS CLIENTES */}
                <div className="grid gap-4 lg:grid-cols-2">

                    {/* VENTAS POR CATEGORÍA: TORTA */}
                    <Card className={cardStyle}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ChartNoAxesCombined className="h-5 w-5 text-[#8C5770]" />

                                <div>
                                    <CardTitle className="text-[#5F3B50]">
                                        Ventas por categoría
                                    </CardTitle>

                                    <CardDescription>
                                        Ingresos generados por cada categoría.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="h-[310px] w-full">
                                {salesByCategory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={salesByCategory}
                                                dataKey="revenue"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                outerRadius={105}
                                                paddingAngle={2}
                                            >
                                                {salesByCategory.map((category) => (
                                                    <Cell
                                                        key={String(category.id)}
                                                        fill={getCategoryColor(category.id)}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value) => [
                                                    formatCurrency(Number(value)),
                                                    'Ingresos',
                                                ]}
                                                contentStyle={chartStyle}
                                            />

                                            <Legend
                                                verticalAlign="bottom"
                                                iconType="circle"
                                                wrapperStyle={{
                                                    fontSize: '12px',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        No hay ventas por categoría para mostrar.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* NUEVOS CLIENTES: ÁREA */}
                    <Card className={cardStyle}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-[#8C5770]" />

                                <div>
                                    <CardTitle className="text-[#5F3B50]">
                                        Nuevos clientes
                                    </CardTitle>

                                    <CardDescription>
                                        Evolución de los registros durante el período.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="mb-3">
                                <p className="text-3xl font-bold text-[#5F3B50]">
                                    {stats.newCustomers}
                                </p>

                                <p className="text-xs text-gray-500">
                                    Clientes nuevos en el período
                                </p>
                            </div>

                            <div className="h-[230px] w-full">
                                {customersChart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={customersChart}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="customersGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#8C5770"
                                                        stopOpacity={0.35}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#D5C5D9"
                                                        stopOpacity={0.02}
                                                    />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#E8DDE6"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                minTickGap={15}
                                                tick={{ fill: '#8B7A84' }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                tick={{ fill: '#8B7A84' }}
                                            />

                                            <Tooltip
                                                formatter={(value) => [
                                                    value,
                                                    'Clientes nuevos',
                                                ]}
                                                contentStyle={chartStyle}
                                            />

                                            <Area
                                                type="monotone"
                                                dataKey="customers"
                                                name="Clientes nuevos"
                                                stroke="#8C5770"
                                                strokeWidth={2.5}
                                                fill="url(#customersGradient)"
                                                activeDot={{ r: 5 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        No hay registros para mostrar.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* TOP CLIENTES Y PRODUCTOS MÁS VENDIDOS */}
                <div className="grid gap-4 lg:grid-cols-2">

                    {/* MEJORES CLIENTES: BARRAS HORIZONTALES */}
                    <Card className={cardStyle}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-[#B58A55]" />

                                <div>
                                    <CardTitle className="text-[#5F3B50]">
                                        Top 5 clientes
                                    </CardTitle>

                                    <CardDescription>
                                        Clientes que más dinero gastaron en el período.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="h-[300px] w-full">
                                {topCustomers.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={topCustomers}
                                            layout="vertical"
                                            margin={{
                                                top: 5,
                                                right: 20,
                                                left: 10,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                                stroke="#E8DDE6"
                                            />

                                            <XAxis
                                                type="number"
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                tick={{ fill: '#8B7A84' }}
                                                tickFormatter={formatCompactCurrency}
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={105}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                tick={{ fill: '#8B7A84' }}
                                            />

                                            <Tooltip
                                                formatter={(value, name) => {
                                                    if (name === 'Gastado') {
                                                        return [
                                                            formatCurrency(Number(value)),
                                                            'Total gastado',
                                                        ];
                                                    }

                                                    return [
                                                        value,
                                                        'Pedidos',
                                                    ];
                                                }}
                                                labelFormatter={(label) => label}
                                                contentStyle={chartStyle}
                                            />

                                            <Bar
                                                dataKey="totalSpent"
                                                name="Gastado"
                                                fill="#8C5770"
                                                radius={[0, 5, 5, 0]}
                                                maxBarSize={28}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        Todavía no hay clientes con compras confirmadas.
                                    </div>
                                )}
                            </div>

                            {topCustomers.length > 0 && (
                                <div className="mt-3 border-t border-[#E8DDE6] pt-3">
                                    <div className="space-y-2">
                                        {topCustomers.map((customer, index) => (
                                            <div
                                                key={customer.id}
                                                className="flex items-center justify-between gap-3 text-sm"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5ECF2] text-xs font-semibold text-[#8C5770]">
                                                        {index + 1}
                                                    </span>

                                                    <span className="truncate font-medium text-gray-700">
                                                        {customer.name}
                                                    </span>
                                                </div>

                                                <span className="shrink-0 text-gray-500">
                                                    {customer.ordersCount} pedidos
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* PRODUCTOS MÁS VENDIDOS: COLUMNAS VERTICALES */}
                    <Card className={cardStyle}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-[#8C5770]" />

                                <div>
                                    <CardTitle className="text-[#5F3B50]">
                                        Productos más vendidos
                                    </CardTitle>

                                    <CardDescription>
                                        Los cinco productos con más unidades vendidas.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="h-[300px] w-full">
                                {topProducts.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={topProducts}
                                            margin={{
                                                top: 10,
                                                right: 15,
                                                left: 0,
                                                bottom: 35,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#E8DDE6"
                                            />

                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                angle={-25}
                                                textAnchor="end"
                                                interval={0}
                                                tick={{ fill: '#8B7A84' }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                tick={{ fill: '#8B7A84' }}
                                            />

                                            <Tooltip
                                                formatter={(value) => [
                                                    `${value} unidades`,
                                                    'Vendidas',
                                                ]}
                                                contentStyle={chartStyle}
                                            />

                                            <Bar
                                                dataKey="quantity"
                                                name="Unidades"
                                                fill="#C28DA6"
                                                radius={[5, 5, 0, 0]}
                                                maxBarSize={45}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        Todavía no hay productos vendidos.
                                    </div>
                                )}
                            </div>

                            {topProducts.length > 0 && (
                                <div className="mt-3 border-t border-[#E8DDE6] pt-3">
                                    <div className="space-y-2">
                                        {topProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between gap-3 text-sm"
                                            >
                                                <span className="min-w-0 truncate font-medium text-gray-700">
                                                    {product.name}
                                                </span>

                                                <span className="shrink-0 text-gray-500">
                                                    {formatCurrency(product.revenue)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* INVENTARIO Y ALERTAS */}
                <Card className={cardStyle}>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-[#5F3B50]">
                                    Alertas de inventario
                                </CardTitle>

                                <CardDescription>
                                    Productos con cinco unidades o menos disponibles.
                                </CardDescription>
                            </div>

                            <div className="rounded-lg bg-[#FFF4E5] p-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[#E8DDE6] bg-[#FAF7F9] hover:bg-[#FAF7F9]">
                                    <TableHead className="text-gray-600">
                                        Producto
                                    </TableHead>

                                    <TableHead className="text-right text-gray-600">
                                        Stock disponible
                                    </TableHead>

                                    <TableHead className="text-right text-gray-600">
                                        Estado
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {lowStockProducts.length > 0 ? (
                                    lowStockProducts.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            className="border-[#E8DDE6]"
                                        >
                                            <TableCell className="font-medium text-gray-700">
                                                {product.name}
                                            </TableCell>

                                            <TableCell className="text-right text-gray-600">
                                                {product.stock} unidades
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={
                                                        product.stock === 0
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className={
                                                        product.stock === 0
                                                            ? ''
                                                            : 'border border-[#F2BFBD] bg-[#FFF0EF] text-[#A34F4B] hover:bg-[#FFF0EF]'
                                                    }
                                                >
                                                    {product.stock === 0
                                                        ? 'Sin stock'
                                                        : 'Stock bajo'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-[#E8DDE6]">
                                        <TableCell
                                            colSpan={3}
                                            className="h-24 text-center text-gray-500"
                                        >
                                            <CheckCircle2 className="mr-2 inline h-4 w-4 text-green-600" />
                                            No hay alertas de stock.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* PEDIDOS RECIENTES */}
                <Card className={cardStyle}>
                    <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-[#5F3B50]">
                                    Pedidos recientes
                                </CardTitle>

                                <CardDescription>
                                    Últimos pedidos registrados en Meraki.
                                </CardDescription>
                            </div>

                            <Badge
                                variant="outline"
                                className="w-fit border-[#D5C5D9] bg-[#FAF7F9] text-[#8C5770]"
                            >
                                {recentOrders.length} pedidos
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[#E8DDE6] bg-[#FAF7F9] hover:bg-[#FAF7F9]">
                                    <TableHead className="text-gray-600">
                                        Pedido
                                    </TableHead>
                                    <TableHead className="text-gray-600">
                                        Cliente
                                    </TableHead>
                                    <TableHead className="text-gray-600">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="text-gray-600">
                                        Estado
                                    </TableHead>

                                    <TableHead className="text-right text-gray-600">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="border-[#E8DDE6]"
                                        >
                                            <TableCell className="font-semibold text-[#8C5770]">
                                                #{order.id}
                                            </TableCell>

                                            <TableCell className="text-gray-700">
                                                {order.customer}
                                            </TableCell>

                                            <TableCell className="text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={getStatusVariant(order.status)}
                                                >
                                                    {order.statusLabel}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right font-medium text-gray-700">
                                                {formatCurrency(order.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-[#E8DDE6]">
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-gray-500"
                                        >
                                            No hay pedidos registrados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* RENDIMIENTO DE ENVÍOS */}
                <Card className={cardStyle}>
                    <CardHeader>
                        <CardTitle className="text-[#5F3B50]">
                            Rendimiento de envíos
                        </CardTitle>

                        <CardDescription>
                            Resumen de entregas del período seleccionado.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-3">

                            <div className="flex items-center gap-3 rounded-xl border border-[#E8DDE6] bg-[#FAF7F9] p-4">
                                <div className="rounded-full bg-green-100 p-2 text-green-700 dark:bg-green-950 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Completados
                                    </p>

                                    <p className="text-xl font-bold text-[#5F3B50]">
                                        {stats.completedShipments}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-[#E8DDE6] bg-[#FAF7F9] p-4">
                                <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                    <Clock className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Pendientes
                                    </p>

                                    <p className="text-xl font-bold text-[#5F3B50]">
                                        {stats.pendingShipments}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-[#E8DDE6] bg-[#FAF7F9] p-4">
                                <div className="rounded-full bg-red-100 p-2 text-red-700 dark:bg-red-950 dark:text-red-400">
                                    <XCircle className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Fallidos
                                    </p>

                                    <p className="text-xl font-bold text-[#5F3B50]">
                                        {stats.failedShipments}
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Tasa de entregas completadas
                                </span>

                                <span className="text-sm font-bold text-[#8C5770]">
                                    {stats.deliveryRate.toFixed(2)}%
                                </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-[#F0E8EF]">
                                <div
                                    className="h-full rounded-full bg-[#8C5770] transition-all"
                                    style={{
                                        width: `${shipmentPercentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PIE */}
                <div className="flex items-center justify-center border-t border-[#E8DDE6] py-4">
                    <p className="text-sm text-gray-400">
                        Meraki · Panel de administración
                    </p>
                </div>

            </div>
        </AdminLayout>
    );
}
