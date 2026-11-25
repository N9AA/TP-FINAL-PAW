
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ticket de compra - Meraki</title>

    <style>
        @page {
            size: A5 portrait;
            margin: 10mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #51464D;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .ticket {
            width: 100%;
            border: 1px solid #E8DDE6;
            padding: 15px;
        }

        /* ENCABEZADO */

        .header {
            text-align: center;
            padding-bottom: 13px;
            border-bottom: 2px solid #8C5770;
        }

        .brand {
            font-family: DejaVu Serif, serif;
            font-size: 27px;
            font-weight: bold;
            letter-spacing: 3px;
            color: #8C5770;
            margin: 0;
        }

        .subtitle {
            font-size: 8px;
            letter-spacing: 2.5px;
            color: #A58B9B;
            text-transform: uppercase;
            margin-top: 4px;
        }

        .order-label {
            margin-top: 13px;
            color: #927A88;
            font-size: 8px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .order-number {
            font-family: DejaVu Serif, serif;
            font-size: 17px;
            font-weight: bold;
            color: #8C5770;
            margin-top: 4px;
        }

        /* EMPRESA */

        .company {
            text-align: center;
            background-color: #FAF7F9;
            padding: 9px;
            margin-top: 13px;
            border: 1px solid #E8DDE6;
        }

        .company-name {
            font-family: DejaVu Serif, serif;
            font-size: 12px;
            font-weight: bold;
            color: #8C5770;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 8px;
            line-height: 1.6;
            color: #756873;
        }

        /* SECCIONES */

        .section {
            margin-top: 15px;
        }

        .section-title {
            font-family: DejaVu Serif, serif;
            font-size: 12px;
            color: #8C5770;
            font-weight: bold;
            margin: 0 0 8px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #E8DDE6;
        }

        /* DATOS DEL CLIENTE */

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 3px 2px;
            vertical-align: top;
            border: none;
            line-height: 1.4;
        }

        .info-label {
            width: 85px;
            color: #8C5770;
            font-weight: bold;
        }

        /* TABLA DE PRODUCTOS */

        .products {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            border: 1px solid #E8DDE6;
        }

        .products thead {
            display: table-header-group;
        }

        .products th {
            background-color: #8C5770;
            color: #FFFFFF;
            padding: 8px 5px;
            font-size: 8px;
            font-weight: bold;
            text-align: left;
            border: 1px solid #E8DDE6;
        }

        .products td {
            padding: 7px 5px;
            border: 1px solid #E8DDE6;
            font-size: 8px;
            vertical-align: middle;
        }

        .products tbody tr:nth-child(even) {
            background-color: #FAF7F9;
        }

        .products tr {
            page-break-inside: avoid;
        }

        .products .center {
            text-align: center;
            width: 55px;
        }

        .products .price {
            text-align: right;
            white-space: nowrap;
            width: 75px;
        }

        /* TOTALES */

        .totals {
            width: 100%;
            margin-top: 13px;
            page-break-inside: avoid;
        }

        .totals table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals td {
            padding: 5px 3px;
            text-align: right;
            font-size: 9px;
        }

        .total-label {
            color: #756873;
        }

        .total-final td {
            border-top: 2px solid #8C5770;
            padding-top: 9px;
            font-size: 13px;
            font-weight: bold;
            color: #8C5770;
        }

        /* PIE DE PÁGINA */

        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #E8DDE6;
            page-break-inside: avoid;
        }

        .decoration {
            color: #C8A9BC;
            font-size: 10px;
            letter-spacing: 4px;
            margin-bottom: 6px;
        }

        .thank-you {
            font-family: DejaVu Serif, serif;
            font-size: 13px;
            font-style: italic;
            color: #8C5770;
            margin-bottom: 6px;
        }

        .footer-text {
            font-size: 8px;
            color: #927F8A;
            line-height: 1.6;
        }

        .footer-brand {
            font-weight: bold;
            color: #8C5770;
        }

    </style>
</head>

<body>

    @php
        $subtotal = collect($order->content)->sum(function ($item) {
            return (float) data_get($item, 'price', 0)
                * (int) data_get($item, 'qty', 0);
        });

        $shipping = (float) $order->total - $subtotal;
    @endphp

    <div class="ticket">

        <!-- ENCABEZADO -->
        <div class="header">
            <h1 class="brand">MERAKI</h1>

            <div class="subtitle">
                Papelería & detalles
            </div>

            <div class="order-label">
                Comprobante de compra
            </div>

            <div class="order-number">
                N.º {{ $order->id }}
            </div>
        </div>

        <!-- INFORMACIÓN DE LA EMPRESA -->
        <div class="company">
            <div class="company-name">
                Meraki - Papelería
            </div>

            <div class="company-details">
                RUC: 12345678912<br>
                Teléfono: 38741234567<br>
                Correo: meraki2026@gmail.com
            </div>
        </div>

        <!-- DATOS DEL CLIENTE -->
        <div class="section">
            <h3 class="section-title">
                Información del cliente
            </h3>

            <table class="info-table">
                <tr>
                    <td class="info-label">Nombre:</td>
                    <td>
                        {{ data_get($order->address, 'receiver_info.name', '') }}
                        {{ data_get($order->address, 'receiver_info.last_name', '') }}
                    </td>
                </tr>

                <tr>
                    <td class="info-label">Documento:</td>
                    <td>
                        {{ data_get($order->address, 'receiver_info.document', '') }}
                    </td>
                </tr>

                <tr>
                    <td class="info-label">Dirección:</td>
                    <td>
                        {{ data_get($order->address, 'description', '') }},
                        {{ data_get($order->address, 'province', '') }},
                        {{ data_get($order->address, 'city', '') }}
                    </td>
                </tr>

                <tr>
                    <td class="info-label">Referencia:</td>
                    <td>
                        {{ data_get($order->address, 'reference', '') }}
                    </td>
                </tr>

                <tr>
                    <td class="info-label">Teléfono:</td>
                    <td>
                        {{ data_get($order->address, 'receiver_info.phone', '') }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- DETALLE DE LA COMPRA -->
        <div class="section">
            <h3 class="section-title">
                Detalle de la compra
            </h3>

            <table class="products">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="center">Cantidad</th>
                        <th class="price">Precio</th>
                    </tr>
                </thead>

                <tbody>
                    @foreach ($order->content as $item)
                        <tr>
                            <td>
                                {{ data_get($item, 'name', 'Producto') }}
                            </td>

                            <td class="center">
                                {{ data_get($item, 'qty', 0) }}
                            </td>

                            <td class="price">
                                ${{ number_format((float) data_get($item, 'price', 0), 2, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- TOTALES -->
        <div class="totals">
            <table>
                <tr>
                    <td class="total-label">
                        Subtotal:
                    </td>

                    <td>
                        ${{ number_format($subtotal, 2, ',', '.') }}
                    </td>
                </tr>

                <tr>
                    <td class="total-label">
                        Costo de envío:
                    </td>

                    <td>
                        ${{ number_format($shipping, 2, ',', '.') }}
                    </td>
                </tr>

                <tr class="total-final">
                    <td>Total:</td>

                    <td>
                        ${{ number_format((float) $order->total, 2, ',', '.') }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- PIE DE PÁGINA -->
        <div class="footer">
            <div class="decoration">
                ✦ ✧ ✦
            </div>

            <div class="thank-you">
                ¡Gracias por elegir Meraki!
            </div>

            <div class="footer-text">
                Cada detalle está pensado para vos.<br>
                Esperamos que disfrutes tu compra.<br><br>

                <span class="footer-brand">
                    MERAKI · PAPELERÍA
                </span>
            </div>
        </div>

    </div>

</body>
</html>
