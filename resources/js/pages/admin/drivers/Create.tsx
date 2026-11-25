import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
}

interface Props {
    users: User[];
}

export default function Create({ users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        type: '1',
        plate_number: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/drivers');
    };

    return (
        <AdminLayout>
            <Head title="Nuevo conductor" />

            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Nuevo conductor
                </h1>

                <form onSubmit={submit} className="space-y-5 rounded-lg bg-white p-6 shadow">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Usuario
                        </label>

                        <select
                            value={data.user_id}
                            onChange={(e) => setData('user_id', e.target.value)}
                            className="w-full rounded-lg border-gray-300"
                        >
                            <option value="">Seleccione un usuario</option>

                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>

                        {errors.user_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.user_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Tipo de vehículo
                        </label>

                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full rounded-lg border-gray-300"
                        >
                            <option value="1">Motocicleta</option>
                            <option value="2">Automóvil</option>
                        </select>

                        {errors.type && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.type}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Patente
                        </label>

                        <input
                            type="text"
                            value={data.plate_number}
                            onChange={(e) => setData('plate_number', e.target.value)}
                            className="w-full rounded-lg border-gray-300"
                            placeholder="Ingrese la patente"
                        />

                        {errors.plate_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.plate_number}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Guardar
                        </button>

                        <Link
                            href="/admin/drivers"
                            className="rounded-lg bg-gray-200 px-5 py-2 text-gray-700"
                        >
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}