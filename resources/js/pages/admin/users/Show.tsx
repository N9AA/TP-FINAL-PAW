
import { Head, Link } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Role {
    id: number;
    name: string;
}

interface Permission {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface ShowProps {
    user: User;
    permissions: Permission[];
}

export default function Show({ user, permissions }: ShowProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Usuarios', route: '/admin/users' },
                { name: 'Detalles' },
            ]}
        >
            <Head title="Detalles del usuario" />

            <div className="card space-y-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        Ficha del Usuario
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Detalle de identidad y accesos de seguridad.
                    </p>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Nombre Completo
                        </span>

                        <p className="text-lg font-medium text-foreground">
                            {user.name}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Dirección de Email
                        </span>

                        <p className="text-lg font-medium text-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* Roles activos */}
                <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Roles Asignados
                    </span>

                    <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 ? (
                            <p className="text-sm italic text-muted-foreground">
                                Este usuario no posee roles asignados actualmente.
                            </p>
                        ) : (
                            user.roles.map((role) => (
                                <Badge
                                    key={role.id}
                                    variant="secondary"
                                    className="capitalize text-sm py-1 px-3"
                                >
                                    💼 {role.name}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                {/* Permisos efectivos */}
                <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Capacidades de Sistema (Heredados de sus Roles)
                    </span>

                    {permissions.length === 0 ? (
                        <p className="text-sm italic text-destructive">
                            El usuario no tiene permisos efectivos. No podrá realizar acciones protegidas.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border rounded-md bg-muted/20">
                            {permissions.map((perm) => (
                                <div
                                    key={perm.id}
                                    className="text-xs p-2 rounded bg-white border shadow-sm truncate text-muted-foreground"
                                >
                                    🛡️ {perm.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botones de navegación */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t justify-end">
                    <Button variant="outline" asChild>
                        <Link href="/admin/users">
                            Volver al listado
                        </Link>
                    </Button>

                    <Button asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                            Modificar Accesos
                        </Link>
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
