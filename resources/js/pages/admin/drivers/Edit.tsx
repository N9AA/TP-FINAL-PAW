
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
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

interface User {
    id: number;
    name: string;
}

interface Driver {
    id: number;
    user_id: number;
    type: number;
    plate_number: string | null;
}

interface Props {
    driver: Driver;
    users: User[];
}

export default function Edit({ driver, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: String(driver.user_id),
        type: String(driver.type),
        plate_number: driver.plate_number ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/admin/drivers/${driver.id}`);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Conductores',
                    route: '/admin/drivers',
                },
                {
                    name: 'Editar conductor',
                },
            ]}
        >
            <Head title="Editar conductor" />

            <div className="card">
                <form onSubmit={submit}>
                    {/* Usuario */}
                    <div className="mb-4">
                        <label
                            htmlFor="user_id"
                            className="mb-2 block"
                        >
                            Usuario
                        </label>

                        <Select
                            value={data.user_id}
                            onValueChange={(value) =>
                                setData('user_id', value)
                            }
                        >
                            <SelectTrigger
                                id="user_id"
                                className="w-full"
                            >
                                <SelectValue placeholder="Seleccione un usuario" />
                            </SelectTrigger>

                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={String(user.id)}
                                    >
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.user_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.user_id}
                            </div>
                        )}
                    </div>

                    {/* Tipo de vehículo */}
                    <div className="mb-4">
                        <label
                            htmlFor="type"
                            className="mb-2 block"
                        >
                            Tipo de vehículo
                        </label>

                        <Select
                            value={data.type}
                            onValueChange={(value) =>
                                setData('type', value)
                            }
                        >
                            <SelectTrigger
                                id="type"
                                className="w-full"
                            >
                                <SelectValue placeholder="Seleccione un tipo de vehículo" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="1">
                                    Motocicleta
                                </SelectItem>

                                <SelectItem value="2">
                                    Automóvil
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {errors.type && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.type}
                            </div>
                        )}
                    </div>

                    {/* Patente */}
                    <div className="mb-4">
                        <label
                            htmlFor="plate_number"
                            className="mb-2 block"
                        >
                            Patente
                        </label>

                        <Input
                            id="plate_number"
                            className="w-full"
                            placeholder="Ingrese la patente del vehículo"
                            value={data.plate_number}
                            onChange={(e) =>
                                setData('plate_number', e.target.value)
                            }
                        />

                        {errors.plate_number && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.plate_number}
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="border-[#D5C5D9] text-[#5F4665] hover:bg-[#FAF7F9]"
                        >
                            <Link href="/admin/drivers">
                                Cancelar
                            </Link>
                        </Button>

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
        </AdminLayout>
    );
}
