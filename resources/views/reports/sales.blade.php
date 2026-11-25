
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de ventas - Meraki</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 35px 40px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #594B54;
            margin: 0;
            padding: 0;
        }

        /* ENCABEZADO */
        .header {
            text-align: center;
            border-bottom: 3px solid #8C5770;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .brand {
            font-size: 25px;
            font-weight: bold;
            color: #8C5770;
            letter-spacing: 3px;
        }

        .subtitle {
            color: #A78A9B;
            font-size: 10px;
            margin-top: 5px;
        }

        h2 {
            color: #8C5770;
            font-size: 13px;
            margin-top: 22px;
            margin-bottom: 10px;
        }

        .header h2 {
            font-size: 15px;
            letter-spacing: 1px;
        }

        /* PERÍODO */
        .period {
            text-align: center;
            margin: 15px 0;
            font-size: 12px;
            color: #594B54;
        }

        .info {
            width: 100%;
            margin-bottom: 15px;
        }

        .info td {
            padding: 5px;
            color: #594B54;
        }

        /* TARJETAS DE ESTADÍSTICAS */
        .stats {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px;
            margin-bottom: 15px;
        }

        .stats td {
            width: 25%;
            background-color: #F8F3F7;
            border: 1px solid #E5D7E0;
            padding: 12px 7px;
            text-align: center;
        }

        .stat-label {
            color: #A78A9B;
            font-size: 9px;
        }

        .stat-value {
            color: #8C5770;
            font-size: 15px;
            font-weight: bold;
            margin-top: 7px;
        }

        /* TABLAS */
        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            table-layout: fixed;
        }

        table.data th {
            background-color: #8C5770;
            color: #FFFFFF;
            padding: 8px;
            text-align: center;
            font-size: 9px;
            border: 1px solid #8C5770;
        }

        table.data td {
            border: 1px solid #E5D7E0;
            padding: 7px;
            font-size: 9px;
            color: #594B54;
            word-wrap: break-word;
        }

        table.data tr:nth-child(even) {
            background-color: #FCF9FB;
        }

        /* ALINEACIONES */
        .right {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        /* SIN RESULTADOS */
        .empty {
            text-align: center;
            color: #A78A9B;
            padding: 12px;
            background-color: #FCF9FB;
        }

        /* TOTAL */
        .total {
            font-weight: bold;
            color: #8C5770;
        }

        /* PIE */
        .footer {
            border-top: 1px solid #D5C5D9;
            margin-top: 30px;
            padding-top: 10px;
            text-align: center;
            color: #A78A9B;
            font-size: 8px;
            line-height: 1.6;
        }
    </style>
</head>

<body>

    <div class="header">
        <div class="brand">MERAKI</div>

        <div class="subtitle">
            Papelería creativa y artículos de diseño
        </div>

        <h2>REPORTE DE VENTAS</h2>
    </div>

    <div class="period">
        <strong>Período:</strong> {{ $periodLabel }}
    </div>

    <table class="info">
        <tr>
            <td>
                <strong>Desde:</strong>
                {{ $startDate->format('d/m/Y') }}
            </td>

            <td>
                <strong>Hasta:</strong>
                {{ $endDate->format('d/m/Y') }}
            </td>

            <td class="right">
                <strong>Generado:</strong>
                {{ $generatedAt->format('d/m/Y H:i') }}
            </td>
        </tr>
    </table>

    <h2>Resumen general</h2>

    <table class="stats">
        <tr>
            <td>
                <div class="stat-label">Ingresos por ventas</div>
                <div class="stat-value">
                    ${{ number_format($totalSales, 2, ',', '.') }}
                </div>
            </td>

            <td>
                <div class="stat-label">Pedidos recibidos</div>
                <div class="stat-value">
                    {{ $totalOrders }}
                </div>
            </td>

            <td>
                <div class="stat-label">Ventas confirmadas</div>
                <div class="stat-value">
                    {{ $salesCount }}
                </div>
            </td>

            <td>
                <div class="stat-label">Ticket promedio</div>
                <div class="stat-value">
                    ${{ number_format($averageTicket, 2, ',', '.') }}
                </div>
            </td>
        </tr>
    </table>

    <h2>Ventas por categoría</h2>

    <table class="data">
        <thead>
            <tr>
                <th>Categoría</th>
                <th>Importe vendido</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($salesByCategory as $category)
                <tr>
                    <td>{{ $category['name'] }}</td>

                    <td class="right">
                        ${{ number_format($category['total'], 2, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" class="empty">
                        No hay ventas por categoría en este período.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Productos más vendidos</h2>

    <table class="data">
        <thead>
            <tr>
                <th>Producto</th>
                <th>Unidades vendidas</th>
                <th>Importe vendido</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($topProducts as $product)
                <tr>
                    <td>{{ $product['name'] }}</td>

                    <td class="center">
                        {{ $product['quantity'] }}
                    </td>

                    <td class="right">
                        ${{ number_format($product['total'], 2, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="empty">
                        No hay productos vendidos en este período.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Pedidos por estado</h2>

    <table class="data">
        <thead>
            <tr>
                <th>Estado</th>
                <th>Cantidad de pedidos</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($ordersByStatus as $status)
                <tr>
                    <td>{{ $status['status'] }}</td>

                    <td class="center">
                        {{ $status['quantity'] }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Meraki - Reporte generado automáticamente por el sistema.
    </div>

</body>
</html>
