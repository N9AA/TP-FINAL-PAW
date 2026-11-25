
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';

interface Feature {
    id: number;
    value: string;
    description: string | null;
}

interface Option {
    id: number;
    name: string;
    type: number;
    pivot: {
        features: Feature[];
    };
}

interface Family {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    family: Family;
}

interface Subcategory {
    id: number;
    name: string;
    category: Category;
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
    sku: string;
    name: string;
    description: string | null;
    image_path: string | null;
    image: string | null;
    price: number;
    estado: boolean;
    subcategory: Subcategory;
    options: Option[];
    variants: Variant[];
}

interface Props {
    product: Product;
}

export default function Show({ product }: Props) {
    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Productos',
                    route: '/admin/products',
                },
                {
                    name: product.name,
                },
            ]}
            action={
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md bg-[#D5C5D9] px-4 py-2 text-sm font-medium text-[#5F4665] shadow-sm transition-colors hover:bg-[#C8B3CE]"
                    >
                        Editar
                    </Link>
                </div>
            }
        >
            <Head title={`Detalle de ${product.name}`} />

            <div className="space-y-6">

                {/* Datos generales */}
                <div className="card">
                    <h2 className="mb-5 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-800">
                        Datos generales
                    </h2>

                    <div className="grid items-start gap-8 md:grid-cols-2">

                        <div>
                            {product.image && (
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#F9F6F8] p-2">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-64 w-full rounded-lg object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">

                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Nombre
                                </p>
                                <p className="font-semibold text-gray-800">
                                    {product.name}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    SKU
                                </p>
                                <p className="font-medium text-gray-700">
                                    {product.sku}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Descripción
                                </p>
                                <p className="text-sm leading-relaxed text-gray-700">
                                    {product.description || 'Sin descripción'}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Precio
                                </p>
                                <p className="text-xl font-bold text-[#8C5770]">
                                    ${Number(product.price).toLocaleString('es-AR')}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Estado
                                </p>

                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                        product.estado
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {product.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Clasificación */}
                <div className="card">
                    <h2 className="mb-5 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-800">
                        Clasificación
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">

                        <div className="rounded-lg border border-gray-200 bg-[#FAF8FA] p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Familia
                            </p>
                            <p className="font-semibold text-gray-800">
                                {product.subcategory?.category?.family?.name || '-'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-[#FAF8FA] p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Categoría
                            </p>
                            <p className="font-semibold text-gray-800">
                                {product.subcategory?.category?.name || '-'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-[#FAF8FA] p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Subcategoría
                            </p>
                            <p className="font-semibold text-gray-800">
                                {product.subcategory?.name || '-'}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Opciones y características */}
                <div className="card">
                    <h2 className="mb-5 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-800">
                        Opciones del producto
                    </h2>

                    {product.options.length > 0 ? (
                        <div className="space-y-5">
                            {product.options.map((option) => (
                                <div
                                    key={option.id}
                                    className="border-b border-gray-200 pb-5 last:border-0 last:pb-0"
                                >
                                    <h3 className="mb-3 font-semibold text-[#8C5770]">
                                        {option.name}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {option.pivot.features.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className="flex items-center gap-2"
                                            >
                                                {option.type === 2 ? (
                                                    <>
                                                        <span
                                                            className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-gray-200"
                                                            style={{
                                                                backgroundColor: feature.value,
                                                            }}
                                                            title={
                                                                feature.description ||
                                                                feature.value
                                                            }
                                                        />

                                                        <span className="text-sm text-gray-700">
                                                            {feature.description ||
                                                                feature.value}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="rounded-lg border border-[#E8DDE6] bg-[#FAF7F9] px-3 py-2 text-sm font-medium text-gray-700">
                                                        {feature.value}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Este producto no tiene opciones configuradas.
                        </p>
                    )}
                </div>

                {/* Variantes */}
                <div className="card">
                    <h2 className="mb-5 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-800">
                        Variantes del producto
                    </h2>

                    {product.variants.length > 0 ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {product.variants.map((variant) => (
                                <div
                                    key={variant.id}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    {variant.image && (
                                        <div className="bg-[#FAF8FA] p-3">
                                            <img
                                                src={variant.image}
                                                alt={`Variante ${variant.sku}`}
                                                className="h-40 w-full rounded-lg object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="p-4">

                                        <div className="mb-4">
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                SKU
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {variant.sku}
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Stock
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {variant.stock}
                                            </p>
                                        </div>

                                        {variant.features.length > 0 && (
                                            <div className="mb-4">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Características
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {variant.features.map((feature) => (
                                                        <span
                                                            key={feature.id}
                                                            className="rounded-lg border border-[#E8DDE6] bg-[#FAF7F9] px-3 py-1.5 text-sm text-gray-700"
                                                        >
                                                            {feature.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Link
                                            href={`/admin/products/${product.id}/variants/${variant.id}`}
                                            className="mt-2 flex w-full items-center justify-center rounded-md bg-[#8C5770] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#75465C]"
                                        >
                                            Gestionar variante
                                        </Link>

                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Este producto todavía no tiene variantes.
                        </p>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
