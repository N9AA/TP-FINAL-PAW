
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Family {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    family_id: number;
}

interface Subcategory {
    id: number;
    name: string;
    category_id: number;
    estado: boolean;
    category: {
        id: number;
        family_id: number;
    };
}

interface Props {
    subcategory: Subcategory;
    families: Family[];
    categories: Category[];
}

export default function Edit({
    subcategory,
    families,
    categories,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        family_id: String(subcategory.category.family_id),
        category_id: String(subcategory.category_id),
        name: subcategory.name,
        estado: subcategory.estado,
    });

    const filteredCategories = data.family_id
        ? categories.filter(
              (category) =>
                  category.family_id === Number(data.family_id),
          )
        : [];

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/admin/subcategories/${subcategory.id}`);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Subcategorías',
                    route: '/admin/subcategories',
                },
                {
                    name: subcategory.name,
                },
            ]}
        >
            <Head title={`Editar ${subcategory.name}`} />

            <div className="card">
                <form onSubmit={submit}>
                    {/* Familia */}
                    <div className="mb-4">
                        <label
                            htmlFor="family_id"
                            className="mb-2 block"
                        >
                            Familia
                        </label>

                        <Select
                            value={data.family_id}
                            onValueChange={(value) => {
                                setData({
                                    ...data,
                                    family_id: value,
                                    category_id: '',
                                });
                            }}
                        >
                            <SelectTrigger
                                id="family_id"
                                className="w-full"
                            >
                                <SelectValue placeholder="Seleccione una familia" />
                            </SelectTrigger>

                            <SelectContent>
                                {families.map((family) => (
                                    <SelectItem
                                        key={family.id}
                                        value={String(family.id)}
                                    >
                                        {family.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.family_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.family_id}
                            </div>
                        )}
                    </div>

                    {/* Categoría */}
                    <div className="mb-4">
                        <label
                            htmlFor="category_id"
                            className="mb-2 block"
                        >
                            Categoría
                        </label>

                        <Select
                            value={data.category_id}
                            onValueChange={(value) =>
                                setData('category_id', value)
                            }
                            disabled={!data.family_id}
                        >
                            <SelectTrigger
                                id="category_id"
                                className="w-full"
                            >
                                <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>

                            <SelectContent>
                                {filteredCategories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.category_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.category_id}
                            </div>
                        )}
                    </div>

                    {/* Nombre */}
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="mb-2 block"
                        >
                            Nombre
                        </label>

                        <Input
                            id="name"
                            name="name"
                            className="w-full"
                            placeholder="Ingrese el nombre de la subcategoría"
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                        />

                        {errors.name && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.estado}
                                onChange={(e) =>
                                    setData('estado', e.target.checked)
                                }
                            />
                            Activa
                        </label>

                        {errors.estado && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.estado}
                            </div>
                        )}
                    </div>

                    {/* Botón */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}


