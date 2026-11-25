
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

interface Subcategory {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    subcategories: Subcategory[];
}

interface Family {
    id: number;
    name: string;
    categories: Category[];
}

interface Props {
    families: Family[];
}

export default function Create({ families }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        sku: '',
        name: '',
        description: '',
        image: null as File | null,
        price: '',
        subcategory_id: '',
        estado: true,
    });

    const [familyId, setFamilyId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories =
        families.find((family) => family.id.toString() === familyId)?.categories || [];

    const subcategories =
        categories.find((category) => category.id.toString() === categoryId)?.subcategories || [];

    useEffect(() => {
        if (!data.image) {
            setImagePreview(null);
            return;
        }

        const url = URL.createObjectURL(data.image);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.image]);

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/admin/products', {
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: 'El formulario contiene errores.',
                });
            },
        });
    };

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
                    name: 'Nuevo',
                },
            ]}
        >
            <Head title="Crear producto" />

            <div className="card">
                <form onSubmit={submit}>
                    {/* Imagen */}
                    <div className="mb-4">
                        <label className="mb-2 block">Imagen</label>

                        <figure className="relative">
                            <div className="absolute top-4 right-4">
                                <label className="flex items-center px-4 py-2 rounded-lg bg-white cursor-pointer text-gray-700">
                                    <Camera size={18} className="mr-2" />
                                    Seleccionar imagen

                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData('image', e.target.files?.[0] || null)
                                        }
                                    />
                                </label>
                            </div>

                            <img
                                className="aspect-[16/9] object-cover object-center w-full rounded-lg"
                                src={imagePreview || '/img/noImage.png'}
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
                    <div className="mb-4">
                        <label htmlFor="sku" className="mb-2 block">
                            Código
                        </label>

                        <Input
                            id="sku"
                            className="w-full"
                            placeholder="Ingrese el código del producto"
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                        />

                        {errors.sku && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.sku}
                            </div>
                        )}
                    </div>

                    {/* Nombre */}
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-2 block">
                            Nombre
                        </label>

                        <Input
                            id="name"
                            className="w-full"
                            placeholder="Ingrese el nombre del producto"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        {errors.name && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="mb-4">
                        <label htmlFor="description" className="mb-2 block">
                            Descripción
                        </label>

                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-md border p-2"
                            placeholder="Ingrese la descripción del producto"
                        />

                        {errors.description && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    {/* Familia */}
                    <div className="mb-4">
                        <label htmlFor="family_id" className="mb-2 block">
                            Familia
                        </label>

                        <select
                            id="family_id"
                            className="w-full rounded-md border p-2"
                            value={familyId}
                            onChange={(e) => {
                                setFamilyId(e.target.value);
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
                    <div className="mb-4">
                        <label htmlFor="category_id" className="mb-2 block">
                            Categoría
                        </label>

                        <select
                            id="category_id"
                            className="w-full rounded-md border p-2"
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
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
                    <div className="mb-4">
                        <label htmlFor="subcategory_id" className="mb-2 block">
                            Subcategoría
                        </label>

                        <select
                            id="subcategory_id"
                            className="w-full rounded-md border p-2"
                            value={data.subcategory_id}
                            onChange={(e) => setData('subcategory_id', e.target.value)}
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
                    <div className="mb-4">
                        <label htmlFor="price" className="mb-2 block">
                            Precio
                        </label>

                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            className="w-full"
                            placeholder="Ingrese el precio del producto"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                        />

                        {errors.price && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.price}
                            </div>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.estado}
                                onChange={(e) => setData('estado', e.target.checked)}
                            />
                            Activo
                        </label>

                        {errors.estado && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.estado}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
