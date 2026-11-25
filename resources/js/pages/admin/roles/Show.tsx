
import { Head, Link } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    role: Role;
}

export default function Show({ role }: Props) {
    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Roles', route: '/admin/roles' },
                { name: 'Detalles' },
            ]}
        >
            <Head title="Detalles del rol" />

            <div className="card space-y-6">
                {/* Encabezado */}
                <div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Información del rol y accesos asociados.
                    </p>
                </div>

                {/* Nombre del rol */}
                <div>
                    <span className="mb-1 block text-sm font-semibold text-muted-foreground">
                        Nombre Interno
                    </span>

                    <p className="text-xl font-medium">
                        {role.name}
                    </p>
                </div>

                {/* Permisos habilitados */}
                <div className="space-y-3">
                    <span className="block text-sm font-semibold text-muted-foreground">
                        Permisos Habilitados
                    </span>

                    {role.permissions.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">
                            Este rol no cuenta con ningún permiso asignado.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {role.permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="rounded border bg-muted/30 p-2 text-sm"
                                >
                                    🛡️ {permission.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex flex-col justify-end gap-2 border-t pt-4 sm:flex-row">
                    <Button variant="outline" asChild>
                        <Link href="/admin/roles">
                            Volver al listado
                        </Link>
                    </Button>

                    <Button asChild>
                        <Link href={`/admin/roles/${role.id}/edit`}>
                            Ir a Editar
                        </Link>
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
