import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';

interface Driver {
    id: number;
    user: {
        id: number;
        name: string;
    };
    type: number;
    plate_number: string | null;
}

interface Props {
    driver: Driver;
}

export default function Show({ driver }: Props) {
    return (
        <AdminLayout>
            <Head title="Detalle del conductor" />

            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Detalle del conductor
                </h1>

                <div className="space-y-4 rounded-lg bg-white p-6 shadow">
                    <div>
                        <p className="text-sm text-gray-500">ID</p>
                        <p className="font-medium">{driver.id}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Conductor</p>
                        <p className="font-medium">{driver.user?.name ?? 'Sin usuario'}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Vehículo</p>
                        <p className="font-medium">
                            {driver.type === 1 ? 'Motocicleta' : 'Automóvil'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Patente</p>
                        <p className="font-medium">{driver.plate_number ?? '-'}</p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={`/admin/drivers/${driver.id}/edit`}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                        >
                            Editar
                        </Link>

                        <Link
                            href="/admin/drivers"
                            className="rounded-lg bg-gray-200 px-4 py-2"
                        >
                            Volver
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}