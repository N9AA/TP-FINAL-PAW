
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Role {
    id: number;
    name: string;
}

interface DocumentType {
    value: string;
    name: string;
}

interface Props {
    roles: Role[];
    documentTypes: DocumentType[];
}

export default function Create({ roles, documentTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        last_name: '',
        document_type: '',
        document: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
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
        post('/admin/users');
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Usuarios', route: '/admin/users' },
                { name: 'Nuevo' },
            ]}
        >
            <Head title="Crear usuario" />

            <div className="card">
                <form onSubmit={handleSubmit}>

                    {/* Datos personales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                        {/* Nombre */}
                        <div className="mb-4">
                            <Label htmlFor="name" className="mb-2 block">
                                Nombre
                            </Label>

                            <Input
                                id="name"
                                className="w-full"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Nombre"
                            />

                            {errors.name && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        {/* Apellido */}
                        <div className="mb-4">
                            <Label htmlFor="last_name" className="mb-2 block">
                                Apellido
                            </Label>

                            <Input
                                id="last_name"
                                className="w-full"
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                placeholder="Apellido"
                            />

                            {errors.last_name && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.last_name}
                                </div>
                            )}
                        </div>

                        {/* Tipo de documento */}
                        <div className="mb-4">
                            <Label htmlFor="document_type" className="mb-2 block">
                                Tipo de documento
                            </Label>

                            <select
                                id="document_type"
                                value={data.document_type}
                                onChange={(e) =>
                                    setData('document_type', e.target.value)
                                }
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            >
                                <option value="" disabled>
                                    Seleccioná un tipo de documento
                                </option>

                                {documentTypes.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            {errors.document_type && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.document_type}
                                </div>
                            )}
                        </div>

                        {/* Documento */}
                        <div className="mb-4">
                            <Label htmlFor="document" className="mb-2 block">
                                Documento
                            </Label>

                            <Input
                                id="document"
                                className="w-full"
                                value={data.document}
                                onChange={(e) =>
                                    setData('document', e.target.value)
                                }
                                placeholder="Número de documento"
                            />

                            {errors.document && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.document}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <Label htmlFor="email" className="mb-2 block">
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
                                placeholder="correo@ejemplo.com"
                            />

                            {errors.email && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div className="mb-4">
                            <Label htmlFor="phone" className="mb-2 block">
                                Teléfono
                            </Label>

                            <Input
                                id="phone"
                                className="w-full"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="Número de teléfono"
                            />

                            {errors.phone && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.phone}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contraseñas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Contraseña */}
                        <div className="mb-4">
                            <Label htmlFor="password" className="mb-2 block">
                                Contraseña
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                className="w-full"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />

                            {errors.password && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="mb-4">
                            <Label
                                htmlFor="password_confirmation"
                                className="mb-2 block"
                            >
                                Confirmar contraseña
                            </Label>

                            <Input
                                id="password_confirmation"
                                type="password"
                                className="w-full"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* Listado de roles */}
                    <div className="mb-4">
                        <Label className="text-base font-semibold mb-3 block">
                            Asignar Roles del Sistema
                        </Label>

                        {roles.length === 0 ? (
                            <p className="text-sm italic text-muted-foreground">
                                No hay roles creados en el sistema.
                            </p>
                        ) : (
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
                        )}

                        {errors.roles && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.roles}
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" asChild>
                            <Link href="/admin/users">
                                Cancelar
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
