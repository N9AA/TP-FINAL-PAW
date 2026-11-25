
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { AlertTriangle } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface DocumentType {
    value: string;
    name: string;
}

interface User {
    id: number;
    name: string;
    last_name: string;
    document_type: number;
    document: string;
    email: string;
    phone: string;
}

interface EditProps {
    user: User;
    roles: Role[];
    userRoles: string[];
    documentTypes: DocumentType[];
}

export default function Edit({
    user,
    roles,
    userRoles,
    documentTypes,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        last_name: user.last_name,
        document_type: String(user.document_type),
        document: user.document,
        email: user.email,
        phone: user.phone,
        password: '',
        password_confirmation: '',
        roles: userRoles,
    });

    const handleCheckboxChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData(
                'roles',
                data.roles.filter((role) => role !== roleName)
            );
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Usuarios', route: '/admin/users' },
                { name: 'Editar' },
            ]}
        >
            <Head title="Editar usuario" />

            <div className="card">
                <h2 className="text-lg font-semibold mb-6">
                    Editar Perfil y Roles: {user.name}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Datos personales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nombre
                            </Label>

                            <Input
                                id="name"
                                className="w-full"
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

                        <div className="space-y-2">
                            <Label htmlFor="last_name">
                                Apellido
                            </Label>

                            <Input
                                id="last_name"
                                className="w-full"
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                            />

                            {errors.last_name && (
                                <p className="text-destructive text-sm">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="document_type">
                                Tipo de documento
                            </Label>

                            <select
                                id="document_type"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.document_type}
                                onChange={(e) =>
                                    setData('document_type', e.target.value)
                                }
                            >
                                <option value="">
                                    Seleccione un tipo de documento
                                </option>

                                {documentTypes.map((item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            {errors.document_type && (
                                <p className="text-destructive text-sm">
                                    {errors.document_type}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="document">
                                Número de documento
                            </Label>

                            <Input
                                id="document"
                                className="w-full"
                                value={data.document}
                                onChange={(e) =>
                                    setData('document', e.target.value)
                                }
                            />

                            {errors.document && (
                                <p className="text-destructive text-sm">
                                    {errors.document}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Correo electrónico
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                className="w-full"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />

                            {errors.email && (
                                <p className="text-destructive text-sm">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Teléfono
                            </Label>

                            <Input
                                id="phone"
                                className="w-full"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />

                            {errors.phone && (
                                <p className="text-destructive text-sm">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Modificar contraseña */}
                    <div className="space-y-4 p-4 border rounded-md bg-amber-50/20 border-amber-200/40">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Nueva contraseña (dejar en blanco para mantener la actual)
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                className="w-full"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                placeholder="••••••••"
                            />

                            {errors.password && (
                                <p className="text-destructive text-sm">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirmar nueva contraseña
                            </Label>

                            <Input
                                id="password_confirmation"
                                type="password"
                                className="w-full"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Modificar roles */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">
                            Gestionar Roles Asignados
                        </Label>

                        {errors.roles && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20 animate-in fade-in-50 duration-200">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{errors.roles}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/30">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.name)}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange(
                                                role.name,
                                                !!checked
                                            )
                                        }
                                    />

                                    <Label
                                        htmlFor={`role-${role.id}`}
                                        className="font-normal capitalize cursor-pointer"
                                    >
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" asChild>
                            <Link href="/admin/users">
                                Cancelar
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Actualizando...'
                                : 'Actualizar Usuario'}
                        </Button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
