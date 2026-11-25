
import { Head, Link } from '@inertiajs/react';
import { Home, ChevronRight } from 'lucide-react';

import StoreLayout from '@/layouts/store-layout';
import AddToCart from './AddToCart';
import AddToCartVariants from './AddToCartVariants';

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
        features: Feature[];
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
    description: string;
    subcategory: Subcategory;
    options: Option[];
    variants: Variant[];
}

interface Props {
    product: Product;
}

export default function Show({ product }: Props) {
    const family = product.subcategory.category.family;
    const category = product.subcategory.category;
    const subcategory = product.subcategory;

    return (
        <StoreLayout>
            <Head title={product.name} />

            <div className="container mx-auto my-4 px-4">
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-2 text-sm">
                        <li>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-body hover:text-purple-600"
                            >
                                <Home className="h-4 w-4" />
                                Home
                            </Link>
                        </li>

                        <li className="flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-body" />
                            <Link
                                href={`/families/${family.id}`}
                                className="text-body hover:text-purple-600"
                            >
                                {family.name}
                            </Link>
                        </li>

                        <li className="flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-body" />
                            <Link
                                href={`/categories/${category.id}`}
                                className="text-body hover:text-purple-600"
                            >
                                {category.name}
                            </Link>
                        </li>

                        <li className="flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-body" />
                            <Link
                                href={`/subcategories/${subcategory.id}`}
                                className="text-body hover:text-purple-600"
                            >
                                {subcategory.name}
                            </Link>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 pb-8">
                {product.variants.length > 0 ? (
                    <AddToCartVariants product={product} />
                ) : (
                    <AddToCart product={product} />
                )}
            </div>
        </StoreLayout>
    );
}
