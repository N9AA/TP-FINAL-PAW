
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Star, Truck } from 'lucide-react';

interface Variant {
    id: number;
    sku: string;
    stock: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    image: string | null;
    description: string | null;
    variants: Variant[];
}

interface Props {
    product: Product;
}

export default function AddToCart({ product }: Props) {
    const [qty, setQty] = useState(1);
    const [processing, setProcessing] = useState(false);

    const variant = product.variants?.[0];
    const stock = Number(variant?.stock ?? 0);

    const getImageUrl = (image: string | null | undefined) => {
        if (!image) {
            return '/storage/products/placeholder.png';
        }

        if (image.startsWith('http')) {
            return image;
        }

        if (image.startsWith('/storage/')) {
            return image;
        }

        return `/storage/${image.replace(/^\/+/, '')}`;
    };

    const addToCart = () => {
        if (processing || !variant || stock <= 0 || qty > stock) {
            return;
        }

        setProcessing(true);

        router.post(
            `/cart/products/${product.id}`,
            {
                qty,
                variant_id: variant.id,
            },
            {
                preserveScroll: true,

                onSuccess: (page) => {
                    const cartCount = Number(
                        page.props.cartCount ?? 0,
                    );

                    window.dispatchEvent(
                        new CustomEvent('cartUpdated', {
                            detail: cartCount,
                        }),
                    );
                },

                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="container mx-auto px-4">
            <div className="card">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <img
                            src={getImageUrl(product.image)}
                            className="aspect-[16/9] w-full object-cover object-center"
                            alt={product.name}
                        />
                    </div>

                    <div>
                        <h1 className="mb-2 text-xl text-gray-600">
                            {product.name}
                        </h1>

                        <div className="mb-2 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                            ))}

                            <span className="ml-1 text-sm text-gray-700">
                                4.7 (55)
                            </span>
                        </div>

                        <p className="mb-2 text-2xl font-semibold text-gray-600">
                            ${Number(product.price).toLocaleString('es-AR')}
                        </p>

                        <p
                            className={`mb-4 text-sm font-medium ${
                                stock > 0
                                    ? 'text-green-700'
                                    : 'text-red-600'
                            }`}
                        >
                            {stock > 0
                                ? `Stock disponible: ${stock}`
                                : 'Producto sin stock'}
                        </p>

                        <div className="mb-4 flex items-center gap-4">
                            <button
                                type="button"
                                className="btn btn-gray"
                                disabled={qty <= 1}
                                onClick={() =>
                                    setQty((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                            >
                                -
                            </button>

                            <span className="inline-block w-6 text-center">
                                {qty}
                            </span>

                            <button
                                type="button"
                                className="btn btn-gray disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={qty >= stock}
                                onClick={() =>
                                    setQty((current) =>
                                        Math.min(stock, current + 1),
                                    )
                                }
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            className="mb-6 w-full rounded-lg bg-[#9D6C83] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#85576D] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={addToCart}
                            disabled={
                                processing ||
                                !variant ||
                                stock <= 0 ||
                                qty > stock
                            }
                        >
                            {processing
                                ? 'Agregando...'
                                : stock <= 0
                                  ? 'Sin stock'
                                  : 'Agregar al carrito'}
                        </button>

                        <div className="mb-4 text-sm">
                            {product.description}
                        </div>

                        <div className="flex items-center gap-4 text-gray-700">
                            <Truck className="h-6 w-6" />
                            <p>Despacho a domicilio</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
