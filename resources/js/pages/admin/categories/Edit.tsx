
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
    estado: boolean;
}

interface Props {
    category: Category;
    families: Family[];
}

export default function Edit({ category, families }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        family_id: String(category.family_id),
        estado: category.estado,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/admin/categories/${category.id}`);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Categorías',
                    route: '/admin/categories',
                },
                {
                    name: category.name,
                },
            ]}
        >
            <Head title={`Editar ${category.name}`} />

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
                            onValueChange={(value) =>
                                setData('family_id', value)
                            }
                        >
                            <SelectTrigger className="w-full">
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
                            className="w-full"
                            placeholder="Ingrese el nombre de la categoría"
                            name="name"
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
