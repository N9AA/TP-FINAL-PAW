<?php
namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;
use RuntimeException;
use Throwable;

class WebhookController extends Controller
{
    public function mercadopago(Request $request)
    {
        $type = $request->input('type') ?? $request->query('type');
        $paymentId = $request->input('data.id') ?? $request->query('data.id');

        if ($type !== 'payment' || !$paymentId) {
            return response()->noContent();
        }

        try {
            $accessToken = config('services.mercadopago.access_token');

            if (!$accessToken) {
                throw new RuntimeException(
                    'No está configurado el access token de Mercado Pago.'
                );
            }

            MercadoPagoConfig::setAccessToken($accessToken);

            $client = new PaymentClient();
            $payment = $client->get($paymentId);

            if ($payment->status !== 'approved') {
                Log::info('Pago todavía no aprobado.', [
                    'payment_id' => $payment->id,
                    'status' => $payment->status,
                ]);

                return response()->noContent();
            }

            $externalReference = $payment->external_reference;

            if (!$externalReference) {
                throw new RuntimeException(
                    'El pago no contiene una referencia externa.'
                );
            }

            $result = DB::transaction(function () use (
                $payment,
                $externalReference
            ) {
                $order = Order::where('payment_id', $externalReference)
                    ->lockForUpdate()
                    ->first();

                if (!$order) {
                    // Permite reconocer una notificación repetida
                    // de una orden cuyo payment_id ya fue actualizado.
                    $processedOrder = Order::where(
                        'payment_id',
                        (string) $payment->id
                    )->first();

                    if ($processedOrder) {
                        return 'already_processed';
                    }

                    throw new RuntimeException(
                        'No se encontró la orden asociada al pago.'
                    );
                }

                // La orden ya no está pendiente: no se vuelve a descontar.
                if ($order->status !== OrderStatus::Pending) {
                    return 'already_processed';
                }

                // Validar importe y moneda.
                if (
                    strtoupper((string) $payment->currency_id) !== 'ARS' ||
                    abs(
                        (float) $payment->transaction_amount -
                        (float) $order->total
                    ) > 0.01
                ) {
                    throw new RuntimeException(
                        'El importe o la moneda del pago no coinciden con la orden.'
                    );
                }

                $items = collect($order->content);

                if ($items->isEmpty()) {
                    throw new RuntimeException(
                        'La orden no contiene productos.'
                    );
                }

                // Agrupar cantidades de una misma variante.
                $requestedVariants = $items
                    ->groupBy(function ($item) {
                        return $item['variant_id'] ?? 'missing';
                    })
                    ->map(function ($group) {
                        $first = $group->first();

                        return [
                            'variant_id' => $first['variant_id'] ?? null,
                            'sku' => $first['sku'] ?? null,
                            'product_id' => $first['id'] ?? null,
                            'qty' => $group->sum(
                                fn ($item) => (int) ($item['qty'] ?? 0)
                            ),
                        ];
                    })
                    ->sortBy('variant_id');

                $variantsToUpdate = [];

                // Bloquear y validar todas las variantes antes de descontar.
                foreach ($requestedVariants as $requested) {
                    if (
                        !$requested['variant_id'] ||
                        !$requested['sku'] ||
                        !$requested['product_id'] ||
                        $requested['qty'] <= 0
                    ) {
                        throw new RuntimeException(
                            'La orden contiene información de variantes incompleta.'
                        );
                    }

                    $variant = Variant::where(
                        'id',
                        $requested['variant_id']
                    )
                        ->where('sku', $requested['sku'])
                        ->where('product_id', $requested['product_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$variant || $variant->stock < $requested['qty']) {
                        // No se descuenta ninguna variante si una falla.
                        $order->update([
                            'payment_id' => (string) $payment->id,
                            'status' => OrderStatus::Failed,
                        ]);

                        Log::critical(
                            'Pago aprobado, pero no se pudo completar la orden por falta de stock o variante inválida.',
                            [
                                'order_id' => $order->id,
                                'payment_id' => $payment->id,
                                'variant_id' => $requested['variant_id'],
                                'sku' => $requested['sku'],
                                'requested' => $requested['qty'],
                                'available' => $variant?->stock,
                            ]
                        );

                        return 'stock_error';
                    }

                    $variantsToUpdate[] = [
                        'variant' => $variant,
                        'qty' => $requested['qty'],
                    ];
                }

                // Todas las variantes tienen stock: ahora sí descontamos.
                foreach ($variantsToUpdate as $entry) {
                    $entry['variant']->decrement('stock', $entry['qty']);
                }

                $order->update([
                    'payment_id' => (string) $payment->id,
                    'status' => OrderStatus::Processing,
                ]);

                return 'processed';
            });

            if ($result === 'processed') {
                Log::info('Pago aprobado y stock actualizado correctamente.', [
                    'payment_id' => $payment->id,
                ]);
            }

            if ($result === 'stock_error') {
                Log::critical(
                    'Se requiere gestionar el reembolso del pago aprobado.',
                    [
                        'payment_id' => $payment->id,
                        'external_reference' => $externalReference,
                    ]
                );
            }

            return response()->noContent();

        } catch (Throwable $e) {
            Log::error('Error al procesar el webhook de Mercado Pago.', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al procesar la notificación.',
            ], 500);
        }
    }
}

