
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

interface Props {
    families: Family[];
}

export default function Create({ families }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        family_id: '',
        estado: true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/admin/categories');
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
                    name: 'Nuevo',
                },
            ]}
        >
            <Head title="Crear categoría" />

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
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
