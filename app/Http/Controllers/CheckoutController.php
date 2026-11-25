<?php
namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Variant;
use App\Enums\OrderStatus;
use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;
use Throwable;

class CheckoutController extends Controller
{
    private const SHIPPING_COST = 5000;

    private const RETURN_URL = 'https://47fe-181-9-211-211.ngrok-free.app/gracias';

    private const NOTIFICATION_URL = 'https://47fe-181-9-211-211.ngrok-free.app/webhooks/mercadopago';

    public function index(Request $request)
    {
        Cart::instance('shopping');

        if (Cart::count() === 0) {
            return redirect()->route('cart.index');
        }

        $request->validate([
            'address_id' => ['required', 'integer'],
        ]);

        $address = Address::where('user_id', Auth::id())
            ->findOrFail($request->address_id);

        $cartItems = Cart::content()->map(function ($item) {
            $options = $item->options->toArray();

            $sku = $options['sku'] ?? null;
            $variantId = $options['variant_id'] ?? null;

            $variant = null;

            if ($variantId && $sku) {
                $variant = Variant::where('id', $variantId)
                    ->where('sku', $sku)
                    ->where('product_id', $item->id)
                    ->first();
            }

            $stock = (int) ($variant?->stock ?? 0);

            $options['stock'] = $stock;

            Cart::update($item->rowId, [
                'options' => $options,
            ]);

            return [
                'id' => $item->id,
                'name' => $item->name,
                'qty' => (int) $item->qty,
                'price' => (float) $item->price,
                'image' => $options['image'] ?? null,
                'sku' => $sku,
                'variant_id' => $variant?->id,
                'stock' => $stock,
            ];
        })->values();

        $cartSubtotal = $cartItems
            ->filter(function ($item) {
                return $item['variant_id']
                    && $item['stock'] > 0
                    && $item['qty'] <= $item['stock'];
            })
            ->sum(function ($item) {
                return $item['price'] * $item['qty'];
            });

        $shipping = self::SHIPPING_COST;
        $total = $cartSubtotal + $shipping;

        return Inertia::render('checkout/Index', [
            'cartItems' => $cartItems,
            'cartSubtotal' => $cartSubtotal,
            'shipping' => $shipping,
            'total' => $total,
            'address' => $address,
            'publicKey' => config('services.mercadopago.public_key'),
        ]);
    }

    public function crearPreferencia(Request $request)
    {
        Cart::instance('shopping');

        if (Cart::count() === 0) {
            return response()->json([
                'message' => 'El carrito está vacío.',
            ], 422);
        }

        $validated = $request->validate([
            'address_id' => ['required', 'integer'],
        ]);

        $address = Address::where('user_id', Auth::id())
            ->findOrFail($validated['address_id']);

        try {
            $order = DB::transaction(function () use ($address) {
                $cartItems = Cart::content();

                $content = [];
                $quantitiesByVariant = [];

                foreach ($cartItems as $item) {
                    $options = $item->options->toArray();

                    $sku = $options['sku'] ?? null;
                    $variantId = $options['variant_id'] ?? null;

                    if (!$sku || !$variantId) {
                        throw new \RuntimeException(
                            "El producto {$item->name} no tiene una variante válida."
                        );
                    }

                    $variantId = (int) $variantId;
                    $qty = (int) $item->qty;

                    if ($qty < 1) {
                        throw new \RuntimeException(
                            "La cantidad de {$item->name} no es válida."
                        );
                    }

                    $quantitiesByVariant[$variantId] =
                        ($quantitiesByVariant[$variantId] ?? 0) + $qty;

                    $content[] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'qty' => $qty,
                        'price' => (float) $item->price,
                        'image' => $options['image'] ?? null,
                        'sku' => $sku,
                        'variant_id' => $variantId,
                        'features' => $options['features'] ?? [],
                    ];
                }

                $variantIds = array_keys($quantitiesByVariant);

                sort($variantIds);

                $variants = Variant::whereIn('id', $variantIds)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($quantitiesByVariant as $variantId => $qty) {
                    $variant = $variants->get($variantId);

                    if (!$variant) {
                        throw new \RuntimeException(
                            'Una de las variantes del carrito ya no existe.'
                        );
                    }

                    if ((int) $variant->stock < $qty) {
                        throw new \RuntimeException(
                            "Stock insuficiente. Disponible: {$variant->stock}."
                        );
                    }
                }

                foreach ($content as $item) {
                    $variant = $variants->get($item['variant_id']);

                    if (
                        !$variant ||
                        $variant->sku !== $item['sku'] ||
                        (int) $variant->product_id !== (int) $item['id']
                    ) {
                        throw new \RuntimeException(
                            "La variante de {$item['name']} ya no es válida."
                        );
                    }
                }

                $subtotal = collect($content)->sum(function ($item) {
                    return $item['price'] * $item['qty'];
                });

                $total = $subtotal + self::SHIPPING_COST;

                return Order::create([
                    'user_id' => Auth::id(),
                    'content' => $content,
                    'address' => $address->toArray(),
                    'payment_method' => 1,
                    'payment_id' => 'pending-' . Str::uuid(),
                    'total' => $total,
                    'status' => OrderStatus::Pending,
                ]);
            });

            // Crear la preferencia NO descuenta stock.
            $preferenceId = $this->generatePreferenceId($order);

            return response()->json([
                'preferenceId' => $preferenceId,
                'orderId' => $order->id,
            ]);

        } catch (Throwable $e) {
            $details = [
                'user_id' => Auth::id(),
                'exception' => get_class($e),
                'error' => $e->getMessage(),
            ];

            if (method_exists($e, 'getApiResponse')) {
                $apiResponse = $e->getApiResponse();

                if ($apiResponse && method_exists($apiResponse, 'getStatusCode')) {
                    $details['status_code'] = $apiResponse->getStatusCode();
                }

                if ($apiResponse && method_exists($apiResponse, 'getContent')) {
                    $details['api_response'] = $apiResponse->getContent();
                }
            }

            Log::error('Error al crear la preferencia de pago.', $details);

            return response()->json([
                'message' => 'No se pudo crear la preferencia de pago. Revisá los registros.',
            ], 422);
        }
    }

    public function gracias(Request $request)
    {
        $orderId = $request->query('app_order_id');

        Log::info('Datos recibidos en la página de gracias:', [
            'app_order_id' => $orderId,
            'payment_id' => $request->query('payment_id'),
            'status' => $request->query('status'),
        ]);

        $order = $orderId
            ? Order::find($orderId)
            : null;

        return Inertia::render('checkout/Gracias', [
            'paymentId' => $order
                ? $order->payment_id
                : $request->query('payment_id'),

            'orderId' => $order?->id,

            'paymentStatus' => $request->query('status'),
        ]);
    }

    public function confirmarCompra(Order $order)
    {
        // La orden debe pertenecer al usuario autenticado.
        abort_unless(
            (int) $order->user_id === (int) Auth::id(),
            403
        );

        // Si el pago no pudo completarse, no hay que vaciar el carrito.
        if ($order->status === OrderStatus::Failed) {
            return response()->json([
                'confirmed' => false,
                'status' => 'failed',
                'message' => 'No se pudo completar la compra. Es necesario revisar el pago.',
            ], 409);
        }

        // El webhook debe haber confirmado la compra primero.
        if ($order->status !== OrderStatus::Processing) {
            return response()->json([
                'confirmed' => false,
                'status' => $order->status,
                'message' => 'La compra todavía no está confirmada.',
            ], 202);
        }

        Cart::instance('shopping');

        // Evitar eliminar el carrito nuevamente si la página consulta varias veces.
        $sessionKey = 'cart_cleared_for_order_' . $order->id;

        if (session()->get($sessionKey)) {
            return response()->json([
                'confirmed' => true,
                'status' => 'processing',
                'cartCount' => Cart::count(),
            ]);
        }

        // Destruir el carrito de la sesión.
        Cart::instance('shopping')->destroy();

        // Guardar el carrito vacío asociado al usuario.
        Cart::instance('shopping')->store(Auth::id());

        // Marcar la orden como procesada para esta sesión.
        session()->put($sessionKey, true);

        return response()->json([
            'confirmed' => true,
            'status' => 'processing',
            'cartCount' => Cart::count(),
        ]);
    }

    private function generatePreferenceId(Order $order): string
    {
        $accessToken = config('services.mercadopago.access_token');

        if (!$accessToken) {
            throw new \RuntimeException(
                'No está configurado el access token de Mercado Pago.'
            );
        }

        MercadoPagoConfig::setAccessToken($accessToken);

        $items = collect($order->content)->map(function ($item) {
            return [
                'id' => (string) $item['variant_id'],
                'title' => $item['name'],
                'quantity' => (int) $item['qty'],
                'unit_price' => (float) $item['price'],
                'currency_id' => 'ARS',
            ];
        })->toArray();

        $items[] = [
            'id' => 'shipping',
            'title' => 'Envío',
            'quantity' => 1,
            'unit_price' => self::SHIPPING_COST,
            'currency_id' => 'ARS',
        ];

        $client = new PreferenceClient();

        // Usamos app_order_id para evitar que Mercado Pago lo reemplace por null.
        $returnUrl = self::RETURN_URL . '?app_order_id=' . $order->id;

        $preference = $client->create([
            'items' => $items,
            'external_reference' => $order->payment_id,
            'back_urls' => [
                'success' => $returnUrl,
                'failure' => $returnUrl,
                'pending' => $returnUrl,
            ],
            'auto_return' => 'approved',
            'notification_url' => self::NOTIFICATION_URL,
        ]);

        return $preference->id;
    }
}
