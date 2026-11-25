
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

interface Props {
    permissions: Permission[];
}

export default function Create({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
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
        post('/admin/roles');
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Roles', route: '/admin/roles' },
                { name: 'Nuevo' },
            ]}
        >
            <Head title="Crear rol" />

            <div className="card space-y-6">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Registra un rol y asignale los permisos correspondientes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre del rol */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nombre del Rol
                        </Label>

                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                            placeholder="Ej: Administrador"
                        />

                        {errors.name && (
                            <p className="text-destructive text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Asignación de permisos */}
                    <div className="space-y-3">
                        <Label>Asignar Permisos</Label>

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
                            <Link href="/admin/roles">
                                Cancelar
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
