
import { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

interface CartItem {
    rowId: string;
    id: number;
    name: string;
    qty: number;
    price: number;
    options: {
        image?: string | null;
        sku?: string;
        variant_id?: number;
        stock?: number;
        features?: Record<string, string>;
    };
}

interface Props {
    cartItems: CartItem[];
    cartCount: number;
    cartSubtotal: number | string;
}

export default function Index({
    cartItems,
    cartCount,
    cartSubtotal,
}: Props) {
    // Actualiza el stock consultando nuevamente el carrito cada 10 segundos.
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['cartItems', 'cartCount', 'cartSubtotal'],
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number | string) =>
        Number(price).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    // Comprueba si algún producto supera el stock disponible.
    const hasInsufficientStock = cartItems.some((item) => {
        const stock = Number(item.options.stock ?? 0);

        return !item.options.variant_id || item.qty > stock || stock <= 0;
    });

    return (
        <StoreLayout>
            <Head title="Carrito de compras" />

            <div className="container mx-auto my-12 px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                    <div className="lg:col-span-5">
                        <div className="mb-2 flex items-center justify-between">
                            <h1 className="text-lg font-semibold">
                                Carrito de compras ({cartCount} productos)
                            </h1>

                            {cartItems.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.delete('/cart', {
                                            preserveScroll: true,
                                        })
                                    }
                                    className="cursor-pointer font-semibold text-gray-600 underline transition-colors hover:text-[#9D6C83] hover:no-underline"
                                >
                                    Limpiar carro
                                </button>
                            )}
                        </div>

                        <div className="card">
                            {cartItems.length > 0 ? (
                                <ul className="space-y-4">
                                    {cartItems.map((item) => {
                                        const stock = Number(
                                            item.options.stock ?? 0,
                                        );

                                        const insufficientStock =
                                            !item.options.variant_id ||
                                            item.qty > stock ||
                                            stock <= 0;

                                        return (
                                            <li
                                                key={item.rowId}
                                                className="flex flex-col gap-4 border-b pb-4 last:border-b-0 last:pb-0 lg:flex-row lg:items-center"
                                            >
                                                <img
                                                    src={
                                                        item.options.image ||
                                                        '/images/placeholder.png'
                                                    }
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            '/images/placeholder.png';
                                                    }}
                                                    className="aspect-[16/9] w-full object-cover object-center lg:w-36"
                                                />

                                                <div className="w-full lg:w-80">
                                                    <p
                                                        className={`text-sm font-medium ${
                                                            insufficientStock
                                                                ? 'text-red-600'
                                                                : ''
                                                        }`}
                                                    >
                                                        <Link
                                                            href={`/products/${item.id}`}
                                                            className="cursor-pointer transition-colors hover:text-[#9D6C83]"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </p>

                                                    {item.options.sku && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            SKU: {item.options.sku}
                                                        </p>
                                                    )}

                                                    {item.options.features &&
                                                        Object.values(
                                                            item.options.features,
                                                        ).map((feature, index) => (
                                                            <p
                                                                key={index}
                                                                className="text-xs text-gray-500"
                                                            >
                                                                {feature}
                                                            </p>
                                                        ))}

                                                    <p
                                                        className={`mt-1 text-xs font-medium ${
                                                            insufficientStock
                                                                ? 'text-red-600'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        Stock disponible: {stock}
                                                    </p>

                                                    {insufficientStock && (
                                                        <p className="mt-1 text-sm font-semibold text-red-600">
                                                            {stock <= 0
                                                                ? 'Este producto no tiene stock disponible.'
                                                                : `Stock insuficiente. Solamente quedan ${stock} unidades disponibles.`}
                                                        </p>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.delete(
                                                                `/cart/${item.rowId}`,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        className="mt-2 cursor-pointer rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-200"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>

                                                <p className="font-medium">
                                                    ${formatPrice(item.price)}
                                                </p>

                                                <div className="ml-auto flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.patch(
                                                                `/cart/${item.rowId}/decrease`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        className="btn btn-gray cursor-pointer"
                                                    >
                                                        -
                                                    </button>

                                                    <span className="inline-block w-6 text-center">
                                                        {item.qty}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            insufficientStock ||
                                                            item.qty >= stock
                                                        }
                                                        onClick={() =>
                                                            router.patch(
                                                                `/cart/${item.rowId}/increase`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        className="btn btn-gray cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="py-6 text-center text-gray-600">
                                    No hay productos en el carrito.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="card">
                            {hasInsufficientStock && (
                                <div className="mb-4 rounded-md bg-red-100 p-3 text-sm font-medium text-red-700">
                                    Hay productos con stock insuficiente.
                                    Modificá las cantidades o quitá esos
                                    productos para continuar.
                                </div>
                            )}

                            <div className="mb-2 flex justify-between font-semibold">
                                <p>Total:</p>
                                <p>${formatPrice(cartSubtotal)}</p>
                            </div>

                            {hasInsufficientStock || cartItems.length === 0 ? (
                                <button
                                    type="button"
                                    disabled
                                    className="block w-full cursor-not-allowed rounded-lg bg-[#9D6C83] px-4 py-2 text-center font-medium text-white opacity-50"
                                >
                                    Continuar compra
                                </button>
                            ) : (
                                <Link
                                    href="/shipping"
                                    className="block w-full cursor-pointer rounded-lg bg-[#9D6C83] px-4 py-2 text-center font-medium text-white transition-colors duration-200 hover:bg-[#85576D]"
                                >
                                    Continuar compra
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
