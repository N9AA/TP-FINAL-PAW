
import { useState, type ReactNode } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

interface Feature {
    id: number;
    description: string;
}

interface Option {
    id: number;
    name: string;
    features: Feature[];
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

interface Product {
    id: number;
    name: string;
    image: string | null;
    price: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Filters {
    selected_features: number[];
    orderBy: number;
    search: string | null;
}

interface Props {
    subcategory: Subcategory;
    options: Option[];
    products: {
        data: Product[];
        links: PaginationLink[];
    };
    filters: Filters;
}

export default function Show({
    subcategory,
    options,
    products,
    filters,
}: Props) {
    const [selectedFeatures, setSelectedFeatures] = useState<number[]>(
        filters.selected_features ?? []
    );

    const [orderBy, setOrderBy] = useState<number>(
        Number(filters.orderBy ?? 1)
    );

    const search = filters.search ?? '';

    const applyFilters = (
        features: number[],
        order: number,
        searchValue: string
    ) => {
        router.get(
            `/subcategories/${subcategory.id}`,
            {
                selected_features: features,
                orderBy: order,
                search: searchValue || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleFeatureChange = (featureId: number) => {
        const updatedFeatures = selectedFeatures.includes(featureId)
            ? selectedFeatures.filter((id) => id !== featureId)
            : [...selectedFeatures, featureId];

        setSelectedFeatures(updatedFeatures);
        applyFilters(updatedFeatures, orderBy, search);
    };

    const handleOrderChange = (value: number) => {
        setOrderBy(value);
        applyFilters(selectedFeatures, value, search);
    };

    const getImageUrl = (image: string | null) => {
        let url: string;

        if (!image) {
            url = '/storage/products/placeholder.png';
        } else if (image.startsWith('http') || image.startsWith('/')) {
            url = image;
        } else {
            url = `/storage/${image}`;
        }

        return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
    };

    return (
        <>
            <Head title={subcategory.name} />

            <div className="my-4 px-4">
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-2 text-sm">
                        <li>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 font-medium text-gray-600 transition-colors hover:text-[#8C5770]"
                            >
                                <svg
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7H9v7H4a1 1 0 0 1-1-1V10Z"
                                    />
                                </svg>
                                Home
                            </Link>
                        </li>

                        <li aria-hidden="true">
                            <svg
                                className="h-4 w-4 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                        </li>

                        <li>
                            <Link
                                href={`/families/${subcategory.category.family.id}`}
                                className="font-medium text-gray-600 transition-colors hover:text-[#8C5770]"
                            >
                                {subcategory.category.family.name}
                            </Link>
                        </li>

                        <li aria-hidden="true">
                            <svg
                                className="h-4 w-4 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                        </li>

                        <li>
                            <Link
                                href={`/categories/${subcategory.category.id}`}
                                className="font-medium text-gray-600 transition-colors hover:text-[#8C5770]"
                            >
                                {subcategory.category.name}
                            </Link>
                        </li>

                        <li aria-hidden="true">
                            <svg
                                className="h-4 w-4 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                        </li>

                        <li
                            aria-current="page"
                            className="font-semibold text-[#8C5770]"
                        >
                            {subcategory.name}
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="bg-[#FAF7F8] py-12">
                <div className="mx-auto flex max-w-7xl flex-col px-4 md:flex-row">
                    {options.length > 0 && (
                        <aside className="mb-8 flex-shrink-0 md:mb-0 md:mr-8 md:w-52">
                            <h2 className="mb-4 text-lg font-semibold text-[#8C5770]">
                                Filtrar productos
                            </h2>

                            <ul className="space-y-4">
                                {options.map((option) => (
                                    <li key={option.id}>
                                        <details
                                            open
                                            className="group overflow-hidden rounded-lg border border-[#E8DDE3] bg-white shadow-sm"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between bg-[#F2E9EE] px-4 py-3 font-semibold text-[#8C5770]">
                                                {option.name}

                                                <svg
                                                    className="h-4 w-4 shrink-0 text-[#8C5770] transition-transform duration-200 group-open:rotate-180"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="m19 9-7 7-7-7"
                                                    />
                                                </svg>
                                            </summary>

                                            <ul className="space-y-3 px-4 py-3">
                                                {option.features.map((feature) => (
                                                    <li key={feature.id}>
                                                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFeatures.includes(feature.id)}
                                                                onChange={() =>
                                                                    handleFeatureChange(feature.id)
                                                                }
                                                                className="rounded border-[#D5C5D9] text-[#8C5770] focus:ring-[#8C5770]"
                                                            />

                                                            {feature.description}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <label
                                htmlFor="orderBy"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Ordenar por:
                            </label>

                            <select
                                id="orderBy"
                                value={orderBy}
                                onChange={(event) =>
                                    handleOrderChange(Number(event.target.value))
                                }
                                className="rounded-lg border-[#E8DDE3] bg-white text-sm text-gray-700 shadow-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                            >
                                <option value={1}>Relevancia</option>
                                <option value={2}>Precio: Mayor a menor</option>
                                <option value={3}>Precio: Menor a mayor</option>
                            </select>
                        </div>

                        <hr className="my-5 border-[#E8DDE3]" />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((product) => (
                                <article
                                    key={product.id}
                                    className="overflow-hidden rounded-xl border border-[#F0E7EC] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                                >
                                    <img
                                        src={getImageUrl(product.image)}
                                        alt={product.name}
                                        className="h-48 w-full bg-[#FAF7F8] object-cover object-center"
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = '/storage/products/placeholder.png';
                                        }}
                                    />

                                    <div className="p-4">
                                        <h2 className="mb-2 min-h-[56px] line-clamp-2 text-lg font-bold text-gray-700">
                                            {product.name}
                                        </h2>

                                        <p className="mb-4 font-semibold text-[#8C5770]">
                                            ${Number(product.price).toLocaleString('es-AR')}
                                        </p>

                                        <Link
                                            href={`/products/${product.id}`}
                                            className="block w-full rounded-lg bg-[#8C5770] px-4 py-2 text-center font-medium text-white transition-colors duration-200 hover:bg-[#74465D]"
                                        >
                                            Ver más
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {products.data.length === 0 && (
                            <p className="py-8 text-center text-gray-500">
                                No se encontraron productos.
                            </p>
                        )}

                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {products.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-[#8C5770] text-white'
                                                : 'border border-[#E8DDE3] bg-white text-[#8C5770] hover:bg-[#F2E9EE]'
                                        }`}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-400"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page: ReactNode) => (
    <StoreLayout>{page}</StoreLayout>
);
