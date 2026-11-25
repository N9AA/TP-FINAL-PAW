
import AdminLayout from '@/layouts/admin-layout';
import ProductVariants from './ProductVariants';

import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

interface Subcategory {
    id: number;
    name: string;
    category_id: number;
}

interface Category {
    id: number;
    name: string;
    family_id: number;
    subcategories: Subcategory[];
}

interface Family {
    id: number;
    name: string;
    categories: Category[];
}

interface Feature {
    id: number;
    value: string;
    description: string;
    option_id: number;
}

interface Option {
    id: number;
    name: string;
    type: number;
    features: Feature[];
}

interface ProductOption extends Option {
    pivot: {
        features: Feature[];
    };
}

interface Variant {
    id: number;
    sku: string;
    stock: number;
    image: string;
    features: Feature[];
}

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    image_path: string | null;
    price: number;
    subcategory_id: number;
    estado: boolean | number;
    subcategory: {
        id: number;
        category: {
            id: number;
            family_id: number;
        };
    };
    options: ProductOption[];
    variants: Variant[];
}

interface Props {
    product: Product;
    families: Family[];
    options: Option[];
}

export default function Edit({ product, families, options }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT' as const,
        sku: product.sku ?? '',
        name: product.name ?? '',
        description: product.description ?? '',
        image: null as File | null,
        price: String(product.price ?? ''),
        subcategory_id: String(product.subcategory_id ?? ''),
        estado: Boolean(product.estado),
    });

    const [familyId, setFamilyId] = useState(
        String(product.subcategory?.category?.family_id ?? '')
    );

    const [categoryId, setCategoryId] = useState(
        String(product.subcategory?.category?.id ?? '')
    );

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories =
        families.find((family) => String(family.id) === familyId)?.categories ?? [];

    const subcategories =
        categories.find((category) => String(category.id) === categoryId)
            ?.subcategories ?? [];

    useEffect(() => {
        if (!data.image) {
            setImagePreview(null);
            return;
        }

        const url = URL.createObjectURL(data.image);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.image]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setData('image', file);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/admin/products/${product.id}`, {
            forceFormData: true,
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: 'El formulario contiene errores.',
                });
            },
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Bien hecho!',
                    text: 'El producto se actualizó correctamente.',
                });
            },
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Productos', route: '/admin/products' },
                { name: product.name },
            ]}
        >
            <Head title={`Editar ${product.name}`} />

            <div className="card">
                <form onSubmit={submit}>
                    {/* Imagen */}
                    <div className="mb-6">
                        <label className="mb-3 block text-sm font-semibold text-gray-700">
                            Imagen
                        </label>

                        <figure className="relative overflow-hidden rounded-xl border border-[#E8DDE6] bg-[#FAF7F9] p-2">
                            <div className="absolute right-5 top-5 z-10">
                                <label className="flex cursor-pointer items-center rounded-lg bg-[#D5C5D9] px-4 py-2.5 text-sm font-medium text-[#5F4665] shadow-md transition-colors hover:bg-[#C8B3CE]">
                                    <Camera size={18} className="mr-2" />
                                    Actualizar imagen

                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            <img
                                className="aspect-[16/9] w-full rounded-lg object-cover object-center"
                                src={
                                    imagePreview ??
                                    (product.image_path
                                        ? `/storage/${product.image_path}`
                                        : '/img/noImage.png')
                                }
                                alt="Vista previa del producto"
                            />
                        </figure>

                        {errors.image && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.image}
                            </div>
                        )}
                    </div>

                    {/* Código */}
                    <div className="mb-5">
                        <label
                            htmlFor="sku"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Código
                        </label>

                        <Input
                            id="sku"
                            className="w-full"
                            placeholder="Ingrese el código del producto"
                            value={data.sku}
                            onChange={(event) => setData('sku', event.target.value)}
                        />

                        {errors.sku && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.sku}
                            </div>
                        )}
                    </div>

                    {/* Nombre */}
                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Nombre
                        </label>

                        <Input
                            id="name"
                            className="w-full"
                            placeholder="Ingrese el nombre del producto"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                        />

                        {errors.name && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="mb-5">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Descripción
                        </label>

                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/15"
                            placeholder="Ingrese la descripción del producto"
                        />

                        {errors.description && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    {/* Familia */}
                    <div className="mb-5">
                        <label
                            htmlFor="family_id"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Familia
                        </label>

                        <select
                            id="family_id"
                            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/15"
                            value={familyId}
                            onChange={(event) => {
                                setFamilyId(event.target.value);
                                setCategoryId('');
                                setData('subcategory_id', '');
                            }}
                        >
                            <option value="" disabled>
                                Seleccione una familia
                            </option>

                            {families.map((family) => (
                                <option key={family.id} value={family.id}>
                                    {family.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categoría */}
                    <div className="mb-5">
                        <label
                            htmlFor="category_id"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Categoría
                        </label>

                        <select
                            id="category_id"
                            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            value={categoryId}
                            onChange={(event) => {
                                setCategoryId(event.target.value);
                                setData('subcategory_id', '');
                            }}
                            disabled={!familyId}
                        >
                            <option value="" disabled>
                                Seleccione una categoría
                            </option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subcategoría */}
                    <div className="mb-5">
                        <label
                            htmlFor="subcategory_id"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Subcategoría
                        </label>

                        <select
                            id="subcategory_id"
                            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            value={data.subcategory_id}
                            onChange={(event) =>
                                setData('subcategory_id', event.target.value)
                            }
                            disabled={!categoryId}
                        >
                            <option value="" disabled>
                                Seleccione una subcategoría
                            </option>

                            {subcategories.map((subcategory) => (
                                <option key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                </option>
                            ))}
                        </select>

                        {errors.subcategory_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.subcategory_id}
                            </div>
                        )}
                    </div>

                    {/* Precio */}
                    <div className="mb-5">
                        <label
                            htmlFor="price"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Precio
                        </label>

                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full"
                            placeholder="Ingrese el precio del producto"
                            value={data.price}
                            onChange={(event) => setData('price', event.target.value)}
                        />

                        {errors.price && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.price}
                            </div>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="mb-6">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 accent-[#8C5770] focus:ring-[#8C5770]"
                                checked={data.estado}
                                onChange={(event) =>
                                    setData('estado', event.target.checked)
                                }
                            />
                            Activo
                        </label>

                        {errors.estado && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.estado}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end border-t border-gray-100 pt-5">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#8C5770] text-white shadow-sm hover:bg-[#75465C]"
                        >
                            {processing ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Administración de opciones y variantes */}
            <div className="mb-12 mt-8">
                <ProductVariants product={product} options={options} />
            </div>
        </AdminLayout>
    );
}
