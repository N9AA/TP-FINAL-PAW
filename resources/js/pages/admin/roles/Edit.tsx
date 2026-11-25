
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface EditProps {
    role: Role;
    permissions: Permission[];
    rolePermissions: string[];
}

export default function Edit({
    role,
    permissions,
    rolePermissions,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: rolePermissions,
    });

    const handleCheckboxChange = (name: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, name]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== name)
            );
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Roles', route: '/admin/roles' },
                { name: 'Editar' },
            ]}
        >
            <Head title="Editar rol" />

            <div className="card space-y-6">
                <div>
                    <h1 className="text-lg font-bold tracking-tight">
                        Editar Rol: {role.name}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Modifica el nombre y los permisos asignados a este rol.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre del rol */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Rol</Label>

                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                        />

                        {errors.name && (
                            <p className="text-destructive text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Modificar permisos */}
                    <div className="space-y-3">
                        <Label>Modificar Permisos</Label>

                        <div className="grid grid-cols-1 gap-4 rounded-md border bg-muted/40 p-4 sm:grid-cols-2 md:grid-cols-3">
                            {permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`perm-${permission.id}`}
                                        checked={data.permissions.includes(
                                            permission.name
                                        )}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange(
                                                permission.name,
                                                !!checked
                                            )
                                        }
                                    />

                                    <Label
                                        htmlFor={`perm-${permission.id}`}
                                        className="cursor-pointer font-normal"
                                    >
                                        {permission.name}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        {errors.permissions && (
                            <p className="text-destructive text-sm">
                                {errors.permissions}
                            </p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col justify-end gap-2 border-t pt-4 sm:flex-row">
                        <Button variant="outline" asChild>
                            <Link href="/admin/roles">Cancelar</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Actualizando...' : 'Actualizar Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
