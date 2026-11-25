
import AdminLayout from '@/layouts/admin-layout';

import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

interface Feature {
    id: number;
    value: string;
    description: string;
    option_id: number;
}

interface Product {
    id: number;
    name: string;
}

interface Variant {
    id: number;
    sku: string;
    stock: number;
    image: string;
    features: Feature[];
}

interface Props {
    product: Product;
    variant: Variant;
}

export default function Variants({ product, variant }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT' as const,
        image: null as File | null,
        sku: variant.sku ?? '',
        stock: String(variant.stock ?? 0),
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        setData('image', event.target.files?.[0] ?? null);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(
            `/admin/products/${product.id}/variants/${variant.id}`,
            {
                forceFormData: true,
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: '¡Error!',
                        text: 'No se pudo actualizar la variante.',
                    });
                },
            }
        );
    };

    const breadcrumbVariant =
        variant.features.length > 0
            ? variant.features.map((feature) => feature.description).join(', ')
            : 'Variante principal';

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Productos', route: '/admin/products' },
                {
                    name: product.name,
                    route: `/admin/products/${product.id}/edit`,
                },
                { name: breadcrumbVariant },
            ]}
        >
            <Head title={`Editar variante - ${product.name}`} />

            <form onSubmit={submit}>
                {/* Imagen de la variante */}
                <div className="relative mb-6 overflow-hidden rounded-xl border border-[#E8DDE6] bg-[#FAF7F9] p-2">
                    <figure>
                        <img
                            className="aspect-[1/1] w-full rounded-lg object-cover object-center"
                            src={imagePreview ?? variant.image}
                            alt="Imagen de la variante"
                        />
                    </figure>

                    <div className="absolute right-5 top-5">
                        <label className="flex cursor-pointer items-center rounded-lg bg-[#D5C5D9] px-4 py-2.5 text-sm font-medium text-[#5F4665] shadow-md transition-colors hover:bg-[#C8B3CE]">
                            <Camera size={18} className="mr-2" />
                            Actualizar imagen

                            <input
                                type="file"
                                name="image"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>

                <div className="card">
                    {/* SKU */}
                    <div className="mb-5">
                        <label
                            htmlFor="sku"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Código (SKU)
                        </label>

                        <Input
                            id="sku"
                            className="w-full"
                            value={data.sku}
                            placeholder="Ingrese el código (SKU)"
                            onChange={(event) =>
                                setData('sku', event.target.value)
                            }
                        />

                        {errors.sku && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.sku}
                            </div>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="mb-6">
                        <label
                            htmlFor="stock"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Stock
                        </label>

                        <Input
                            id="stock"
                            type="number"
                            min="0"
                            step="1"
                            className="w-full"
                            value={data.stock}
                            placeholder="Ingrese el stock"
                            onChange={(event) =>
                                setData('stock', event.target.value)
                            }
                        />

                        {errors.stock && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.stock}
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
                </div>
            </form>
        </AdminLayout>
    );
}
