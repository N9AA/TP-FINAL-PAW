
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Family {
    id: number;
    name: string;
    estado: boolean;
}

interface Props {
    family: Family;
}

export default function Edit({ family }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: family.name,
        estado: family.estado,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/admin/families/${family.id}`);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Familias', route: '/admin/families' },
                { name: family.name },
            ]}
        >
            <Head title={`Editar ${family.name}`} />

            <div className="card">
                <form onSubmit={submit}>
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
                            placeholder="Ingrese el nombre de la familia"
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
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
