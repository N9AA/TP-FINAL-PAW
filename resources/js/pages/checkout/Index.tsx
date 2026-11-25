import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

interface CheckoutItem {
    id: string | number;
    name: string;
    qty: number;
    price: number;
    image?: string | null;
    sku?: string;
    variant_id?: number;
    stock?: number;
}

interface Address {
    id: number;
    type: number;
    description: string;
    province: string;
    city: string;
    reference: string;
}

interface Props {
    publicKey: string;
    cartItems?: CheckoutItem[];
    cartSubtotal?: number;
    shipping?: number;
    total?: number;
    address: Address;
}

interface MercadoPagoBrickController {
    unmount: () => void;
}

interface MercadoPagoInstance {
    bricks: () => {
        create: (
            brick: string,
            container: string,
            settings: {
                initialization: {
                    preferenceId: string;
                };
            }
        ) => Promise<MercadoPagoBrickController>;
    };
}

declare global {
    interface Window {
        MercadoPago?: new (publicKey: string) => MercadoPagoInstance;
    }
}

const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(amount);

export default function Index({
    publicKey,
    cartItems = [],
    cartSubtotal = 0,
    shipping = 5000,
    total: totalAmount,
    address,
}: Props) {
    const controllerRef = useRef<MercadoPagoBrickController | null>(null);

    const [preferenceId, setPreferenceId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const subtotal = Number(cartSubtotal);
    const total = Number(totalAmount ?? subtotal + Number(shipping));

    // Comprueba que todas las variantes tengan stock suficiente.
    const hasInsufficientStock = cartItems.some((item) => {
        const stock = Number(item.stock ?? 0);

        return (
            !item.variant_id ||
            stock <= 0 ||
            item.qty > stock
        );
    });

    /**
     * Actualizar los datos del checkout cada 10 segundos.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['cartItems', 'cartSubtotal', 'total'],
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Obtener el token CSRF de Laravel.
     */
    const getCsrfToken = () => {
        const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='));

        if (cookie) {
            return decodeURIComponent(cookie.split('=').slice(1).join('='));
        }

        return (
            document
                .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? ''
        );
    };

    /**
     * Crear la preferencia solamente cuando el usuario presiona Pagar.
     */
    const handlePayment = async () => {
        if (hasInsufficientStock) {
            setError(
                'Hay productos con stock insuficiente. Volvé al carrito y modificá las cantidades.'
            );
            return;
        }

        if (cartItems.length === 0) {
            setError('No hay productos en el carrito.');
            return;
        }

        if (!address?.id) {
            setError('No se encontró la dirección de envío.');
            return;
        }

        if (!publicKey) {
            setError('No está configurada la clave pública de Mercado Pago.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/checkout/pagar', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    address_id: address.id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'No se pudo iniciar el pago.'
                );
            }

            if (!result.preferenceId) {
                throw new Error(
                    'Mercado Pago no devolvió el ID de preferencia.'
                );
            }

            setPreferenceId(result.preferenceId);
        } catch (err) {
            console.error('Error al iniciar el pago:', err);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al iniciar el pago.'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Inicializar el Brick solamente después de obtener la preferencia.
     */
    useEffect(() => {
        if (!preferenceId) {
            return;
        }

        let cancelled = false;

        const initializeMercadoPago = async () => {
            try {
                let script = document.querySelector<HTMLScriptElement>(
                    'script[src="https://sdk.mercadopago.com/js/v2"]'
                );

                if (!window.MercadoPago) {
                    if (!script) {
                        script = document.createElement('script');
                        script.src = 'https://sdk.mercadopago.com/js/v2';
                        script.async = true;
                        document.body.appendChild(script);
                    }

                    await new Promise<void>((resolve, reject) => {
                        script!.addEventListener(
                            'load',
                            () => resolve(),
                            { once: true }
                        );

                        script!.addEventListener(
                            'error',
                            () =>
                                reject(
                                    new Error(
                                        'No se pudo cargar el SDK de Mercado Pago.'
                                    )
                                ),
                            { once: true }
                        );

                        if (window.MercadoPago) {
                            resolve();
                        }
                    });
                }

                if (cancelled) return;

                if (!window.MercadoPago) {
                    throw new Error(
                        'El SDK de Mercado Pago no está disponible.'
                    );
                }

                const mp = new window.MercadoPago(publicKey);
                const bricksBuilder = mp.bricks();

                const controller = await bricksBuilder.create(
                    'wallet',
                    'walletBrick_container',
                    {
                        initialization: {
                            preferenceId,
                        },
                    }
                );

                if (cancelled) {
                    controller.unmount();
                    return;
                }

                controllerRef.current = controller;
            } catch (err) {
                console.error(
                    'Error al inicializar Mercado Pago:',
                    err
                );

                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'No se pudo cargar el botón de pago.'
                    );
                }
            }
        };

        initializeMercadoPago();

        return () => {
            cancelled = true;
            controllerRef.current?.unmount();
            controllerRef.current = null;
        };
    }, [preferenceId, publicKey]);

    return (
        <StoreLayout>
            <Head title="Finalizar compra" />

            <div className="min-h-screen bg-[#FAF7F9] py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Finalizar compra
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            Completá tu compra de forma segura.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Método de pago */}
                        <div className="col-span-1">
                            <div className="overflow-hidden rounded-lg border border-[#E8DDE6] bg-white shadow-sm">
                                <div className="bg-[#9D6C83] px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white">
                                        Pago
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="rounded-lg border border-[#E8DDE6] p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#9D6C83]">
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#9D6C83]" />
                                            </span>

                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    Mercado Pago
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Pago seguro
                                                </p>
                                            </div>
                                        </div>

                                        {!preferenceId ? (
                                            <>
                                                {hasInsufficientStock && (
                                                    <div className="mt-5 rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">
                                                        Hay productos con stock insuficiente.
                                                        Volvé al carrito para modificar
                                                        las cantidades.
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={handlePayment}
                                                    disabled={
                                                        loading ||
                                                        hasInsufficientStock ||
                                                        cartItems.length === 0
                                                    }
                                                    className="mt-5 w-full rounded-lg bg-[#9D6C83] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#85576D] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {loading
                                                        ? 'Preparando pago...'
                                                        : 'Pagar con Mercado Pago'}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="mt-5">
                                                <div id="walletBrick_container" />
                                            </div>
                                        )}

                                        {error && (
                                            <p
                                                className="mt-4 text-sm text-red-600"
                                                role="alert"
                                            >
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dirección de envío */}
                            <div className="mt-6 overflow-hidden rounded-lg border border-[#E8DDE6] bg-white shadow-sm">
                                <div className="bg-[#9D6C83] px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white">
                                        Dirección de envío
                                    </h2>
                                </div>

                                <div className="p-6 text-sm text-gray-700">
                                    <p className="font-semibold">
                                        {address.description}
                                    </p>

                                    <p>
                                        {address.city}, {address.province}
                                    </p>

                                    <p className="mt-1 text-gray-500">
                                        {address.reference}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de compra */}
                        <div className="col-span-1">
                            <div className="overflow-hidden rounded-lg border border-[#E8DDE6] bg-white shadow-sm">
                                <div className="bg-[#9D6C83] px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white">
                                        Resumen de tu compra
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-5">
                                        {cartItems.map((item, index) => (
                                            <div
                                                key={`${item.id}-${index}`}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={
                                                            item.image ||
                                                            '/images/placeholder.png'
                                                        }
                                                        alt={item.name}
                                                        className="h-16 w-16 rounded-lg border border-[#E8DDE6] object-cover"
                                                        onError={(event) => {
                                                            event.currentTarget.src =
                                                                '/images/placeholder.png';
                                                        }}
                                                    />

                                                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#9D6C83] text-xs font-semibold text-white">
                                                        {item.qty}
                                                    </span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {item.name}
                                                    </p>

                                                    {item.sku && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            SKU: {item.sku}
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Cantidad: {item.qty}
                                                    </p>

                                                    {item.stock !== undefined &&
                                                        item.qty > Number(item.stock) && (
                                                            <p className="mt-1 text-xs font-semibold text-red-600">
                                                                Stock insuficiente
                                                            </p>
                                                        )}
                                                </div>

                                                <p className="whitespace-nowrap text-sm font-medium text-gray-800">
                                                    {formatPrice(
                                                        Number(item.price) *
                                                            Number(item.qty)
                                                    )}
                                                </p>
                                            </div>
                                        ))}

                                        {cartItems.length === 0 && (
                                            <p className="text-sm text-gray-500">
                                                No hay productos para mostrar.
                                            </p>
                                        )}
                                    </div>

                                    <div className="my-5 border-t border-[#E8DDE6]" />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Subtotal
                                            </span>

                                            <span className="font-medium text-gray-800">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Costo de envío
                                            </span>

                                            <span className="font-medium text-gray-800">
                                                {formatPrice(Number(shipping))}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-[#E8DDE6]" />

                                    <div className="flex justify-between">
                                        <span className="text-base font-bold text-gray-900">
                                            Total
                                        </span>

                                        <span className="text-lg font-bold text-[#9D6C83]">
                                            {formatPrice(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/shipping"
                            className="text-sm font-medium text-gray-600 transition-colors hover:text-[#9D6C83]"
                        >
                            ← Volver a direcciones de envío
                        </Link>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}