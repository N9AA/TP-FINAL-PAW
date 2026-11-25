
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    AlertTriangle,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import FlashMessage from '@/components/FlashMessage';

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
    roles: Role[];
}

export default function Index({ roles }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIdSeleccionado(id);
        setIsModalOpen(true);
    };

    const ejecutarEliminacion = () => {
        if (!idSeleccionado) return;

        setIsDeleting(true);

        router.delete(`/admin/roles/${idSeleccionado}`, {
            onSuccess: () => {
                setIsModalOpen(false);
                setIdSeleccionado(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const filteredRoles = roles.filter((role) => {
        const matchesRoleName = role.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesPermission = role.permissions.some((permission) =>
            permission.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        return matchesRoleName || matchesPermission;
    });

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Roles' },
            ]}
            action={
                <Link
                    href="/admin/roles/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#8C5770] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#75445C]"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo rol
                </Link>
            }
        >
            <Head title="Roles" />

            <div className="space-y-5">
                {/* BÚSQUEDA Y CANTIDAD */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8299]" />

                            <Input
                                placeholder="Buscar por rol o permiso..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-lg border-[#E5D9E6] bg-white pl-9 pr-3 text-sm focus-visible:border-[#8C5770] focus-visible:ring-[#8C5770]"
                            />
                        </div>

                        {searchQuery && (
                            <Button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="h-10 shrink-0 rounded-lg bg-[#8C5770] px-3 text-sm font-medium text-white hover:bg-[#75445C]"
                            >
                                <X className="mr-1.5 h-4 w-4" />
                                Limpiar
                            </Button>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        Mostrando{' '}
                        <strong className="font-semibold text-[#765C78]">
                            {filteredRoles.length}
                        </strong>{' '}
                        de {roles.length} roles
                    </div>
                </div>

                {/* TABLA */}

                <div className="relative overflow-x-auto rounded-lg border border-[#E8DCE8] bg-white shadow-sm">
                    <FlashMessage />

                    <table
                        className="table-fixed text-left text-sm text-gray-700"
                        style={{
                            width: 'max-content',
                            minWidth: 'max(100%, 850px)',
                        }}
                    >
                        <colgroup>
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '43%' }} />
                            <col style={{ width: '25%' }} />
                        </colgroup>

                        <thead>
                            <tr className="border-b border-[#E8DCE8] bg-[#F0E7F1] text-[#765C78]">
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left font-semibold"
                                >
                                    ID
                                </th>

                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left font-semibold"
                                >
                                    NOMBRE DEL ROL
                                </th>

                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left font-semibold"
                                >
                                    PERMISOS ASIGNADOS
                                </th>

                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-center font-semibold"
                                >
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRoles.length === 0 ? (
                                <tr className="bg-white">
                                    <td colSpan={4} className="px-4 py-10">
                                        <div className="flex items-center gap-2 rounded-xl border border-[#E8DCE8] bg-[#F8F3F8] p-4 text-sm text-[#765C78]">
                                            <Search className="h-5 w-5 shrink-0" />

                                            <span>
                                                {searchQuery
                                                    ? 'No se encontraron roles que coincidan con la búsqueda.'
                                                    : 'Todavía no hay roles registrados.'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRoles.map((role) => (
                                    <tr
                                        key={role.id}
                                        className="border-b border-[#F0E7F1] bg-white transition-colors hover:bg-[#FCF9FC]"
                                    >
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-4 py-4 font-medium text-gray-600"
                                        >
                                            #{role.id}
                                        </th>

                                        <td className="break-words px-4 py-4 font-semibold text-gray-700">
                                            {role.name}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex max-w-xl flex-wrap gap-1.5">
                                                {role.permissions.length > 0 ? (
                                                    role.permissions.map(
                                                        (permission) => (
                                                            <span
                                                                key={permission.id}
                                                                className="inline-flex items-center rounded-md border border-[#E5D9E6] bg-[#F8F3F8] px-2 py-1 text-xs font-medium text-[#765C78]"
                                                            >
                                                                {permission.name}
                                                            </span>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className="text-xs italic text-gray-400">
                                                        Sin permisos
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                <Link
                                                    href={`/admin/roles/${role.id}`}
                                                    title="Ver detalles del rol"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#8C5770] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#75445C]"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Ver
                                                </Link>

                                                <Link
                                                    href={`/admin/roles/${role.id}/edit`}
                                                    title="Editar rol"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D5C5D9] px-3 py-2 text-xs font-medium text-[#59465B] transition hover:bg-[#C6B1CC]"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(role.id)
                                                    }
                                                    title="Eliminar rol"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2BFBD] px-3 py-2 text-xs font-medium text-[#754B4A] transition hover:bg-[#E9AAA7]"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN */}

            <AlertDialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    if (!isDeleting) {
                        setIsModalOpen(open);

                        if (!open) {
                            setIdSeleccionado(null);
                        }
                    }
                }}
            >
                <AlertDialogContent className="rounded-xl border-[#E8DCE8] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-full bg-[#F9DEDE] p-2 text-[#A34F4F]">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <AlertDialogTitle className="text-xl text-gray-800">
                                ¿Eliminar rol?
                            </AlertDialogTitle>
                        </div>

                        <AlertDialogDescription className="text-sm leading-relaxed text-gray-600">
                            Estás a punto de borrar este rol permanentemente.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-lg border-[#E5D9E6] bg-white text-gray-700 hover:bg-[#F8F3F8]"
                        >
                            Cancelar
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                ejecutarEliminacion();
                            }}
                            className="rounded-lg bg-[#F2BFBD] font-medium text-[#754B4A] shadow-none transition hover:bg-[#E9AAA7]"
                        >
                            {isDeleting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Eliminando...
                                </span>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Sí, eliminar rol
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
