
import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Star, Truck } from 'lucide-react';

interface Feature {
    id: number;
    value: string;
    description: string;
}

interface Option {
    id: number;
    name: string;
    type: number;
    pivot: {
        features: Feature[] | string | null;
    };
}

interface Variant {
    id: number;
    image: string | null;
    sku: string;
    stock: number;
    features: Feature[];
}

interface Product {
    id: number;
    name: string;
    price: number;
    image: string | null;
    description: string | null;
    options: Option[];
    variants: Variant[];
}

interface Props {
    product: Product;
}

export default function AddToCartVariants({ product }: Props) {
    const [qty, setQty] = useState(1);
    const [processing, setProcessing] = useState(false);

    const options = useMemo(() => {
        return product.options.map((option) => {
            let features = option.pivot.features;

            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                } catch {
                    features = [];
                }
            }

            return {
                ...option,
                pivot: {
                    features: Array.isArray(features) ? features : [],
                },
            };
        });
    }, [product.options]);

    const [selectedFeatures, setSelectedFeatures] = useState<
        Record<number, number>
    >(() => {
        const initial: Record<number, number> = {};

        product.options.forEach((option) => {
            let features = option.pivot.features;

            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                } catch {
                    features = [];
                }
            }

            const firstFeature = Array.isArray(features)
                ? features[0]
                : undefined;

            if (firstFeature) {
                initial[option.id] = firstFeature.id;
            }
        });

        return initial;
    });

    const variant = useMemo(() => {
        return product.variants.find((item) => {
            const variantFeatures = item.features.map(
                (feature) => feature.id,
            );

            return (
                variantFeatures.length ===
                    Object.keys(selectedFeatures).length &&
                Object.values(selectedFeatures).every((id) =>
                    variantFeatures.includes(id),
                )
            );
        });
    }, [product.variants, selectedFeatures]);

    const stock = Number(variant?.stock ?? 0);

    const changeFeature = (optionId: number, featureId: number) => {
        setSelectedFeatures((current) => ({
            ...current,
            [optionId]: featureId,
        }));

        setQty(1);
    };

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
        if (
            !variant ||
            processing ||
            stock <= 0 ||
            qty > stock
        ) {
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
                        (page.props as { cartCount?: number }).cartCount ?? 0,
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
                    {/* Imagen del producto o de la variante */}
                    <div className="col-span-1">
                        <figure>
                            <img
                                src={getImageUrl(
                                    variant?.image || product.image,
                                )}
                                className="aspect-[16/9] w-full object-cover object-center"
                                alt={product.name}
                            />
                        </figure>
                    </div>

                    <div className="col-span-1">
                        <h1 className="mb-2 text-xl text-gray-600">
                            {product.name}
                        </h1>

                        {/* Estrellas y puntuación */}
                        <div className="mb-4 flex items-center space-x-2">
                            <ul className="flex space-x-1 text-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <li key={star}>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    </li>
                                ))}
                            </ul>

                            <p className="text-sm text-gray-700">
                                4.7 (55)
                            </p>
                        </div>

                        {/* Precio */}
                        <p className="mb-4 text-2xl font-semibold text-gray-600">
                            ${Number(product.price).toLocaleString('es-AR')}
                        </p>

                        {/* Opciones y características */}
                        <div className="mb-6 flex flex-wrap">
                            {options.map((option) => (
                                <div
                                    key={option.id}
                                    className="mb-4 mr-4"
                                >
                                    <p className="mb-2 text-lg font-semibold">
                                        {option.name}
                                    </p>

                                    <ul className="flex items-center gap-3">
                                        {option.pivot.features.map((feature) => {
                                            const selected =
                                                selectedFeatures[option.id] ===
                                                feature.id;

                                            return (
                                                <li key={feature.id}>
                                                    {option.type === 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeFeature(
                                                                    option.id,
                                                                    feature.id,
                                                                )
                                                            }
                                                            className={`h-8 min-w-20 rounded-lg px-3 text-sm font-semibold uppercase transition-colors ${
                                                                selected
                                                                    ? 'bg-[#9D6C83] text-white'
                                                                    : 'border border-gray-200 text-gray-700 hover:border-[#9D6C83]'
                                                            }`}
                                                            aria-pressed={selected}
                                                        >
                                                            {feature.value}
                                                        </button>
                                                    )}

                                                    {option.type === 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeFeature(
                                                                    option.id,
                                                                    feature.id,
                                                                )
                                                            }
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                                                                selected
                                                                    ? 'border-[#9D6C83] ring-2 ring-[#E8D1DD]'
                                                                    : 'border-gray-200 hover:border-[#9D6C83]'
                                                            }`}
                                                            title={
                                                                feature.description ||
                                                                feature.value
                                                            }
                                                            aria-label={
                                                                feature.description ||
                                                                feature.value
                                                            }
                                                            aria-pressed={selected}
                                                        >
                                                            <span
                                                                className="h-7 w-7 rounded-full border border-black/10"
                                                                style={{
                                                                    backgroundColor:
                                                                        feature.value,
                                                                }}
                                                            />
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Stock */}
                        {variant ? (
                            <p
                                className={`mb-4 text-sm font-medium ${
                                    stock > 0
                                        ? 'text-green-700'
                                        : 'text-red-600'
                                }`}
                            >
                                {stock > 0
                                    ? `Stock disponible: ${stock}`
                                    : 'Variante sin stock'}
                            </p>
                        ) : (
                            <p className="mb-4 text-sm text-red-600">
                                No existe una variante con las características
                                seleccionadas.
                            </p>
                        )}

                        {/* Cantidad */}
                        <div className="mb-6 flex items-center space-x-6">
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
                                disabled={!variant || stock <= 0 || qty >= stock}
                                onClick={() =>
                                    setQty((current) =>
                                        Math.min(stock, current + 1),
                                    )
                                }
                            >
                                +
                            </button>
                        </div>

                        {/* Agregar al carrito */}
                        <button
                            type="button"
                            className="mb-6 w-full rounded-lg bg-[#9D6C83] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#85576D] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={addToCart}
                            disabled={
                                !variant ||
                                processing ||
                                stock <= 0 ||
                                qty > stock
                            }
                        >
                            {processing
                                ? 'Agregando...'
                                : !variant || stock <= 0
                                  ? 'Sin stock'
                                  : 'Agregar al carrito'}
                        </button>

                        {/* Descripción */}
                        <div className="mb-4 text-sm text-gray-700">
                            {product.description}
                        </div>

                        {/* Despacho */}
                        <div className="flex items-center space-x-4 text-gray-700">
                            <Truck className="h-6 w-6" />
                            <p>Despacho a domicilio</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
