import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

import {
    AlertTriangle,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    Search,
    X,
} from 'lucide-react';

import FlashMessage from '@/components/FlashMessage';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface IndexProps {
    users: User[];
}

export default function Index({ users }: IndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const limpiarFiltros = () => {
        setSearchQuery('');
    };

    const handleDelete = (id: number) => {
        setIdSeleccionado(id);
        setIsModalOpen(true);
    };

    const ejecutarEliminacion = () => {
        if (!idSeleccionado) return;

        setIsDeleting(true);

        router.delete(`/admin/users/${idSeleccionado}`, {
            onSuccess: () => {
                setIsModalOpen(false);
                setIdSeleccionado(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();

        const matchesName = user.name.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);

        const matchesRole = user.roles.some((role) =>
            role.name.toLowerCase().includes(query)
        );

        return matchesName || matchesEmail || matchesRole;
    });

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Usuarios' },
            ]}
        >
            <Head title="Usuarios" />

            <div className="card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Administra las cuentas de usuario y sus niveles de acceso globales.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="bg-[#8C5770] hover:bg-[#75445C] text-white shadow-sm"
                    >
                        <Link href="/admin/users/create">
                            <Plus className="w-4 h-4 mr-2" />
                            Registrar Usuario
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row flex-1 items-center gap-2 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#987F98]" />

                            <Input
                                placeholder="Buscar por nombre, email o rol..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 pl-9 pr-9 border-[#E8DCE8] focus-visible:ring-[#8C5770]"
                            />

                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#987F98] hover:text-[#8C5770]"
                                    title="Limpiar búsqueda"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={limpiarFiltros}
                            className="h-9 w-full sm:w-auto bg-[#8C5770] hover:bg-[#75445C] text-white"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Limpiar filtros
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Mostrando <strong>{filteredUsers.length}</strong> de {users.length} usuarios
                    </div>
                </div>

                <div className="relative overflow-x-auto rounded-lg border border-[#E8DCE8] bg-white shadow-sm">
                    <FlashMessage />

                    <table
                        className="table-fixed text-left text-sm text-gray-700"
                        style={{
                            width: 'max-content',
                            minWidth: 'max(100%, 950px)',
                        }}
                    >
                        <colgroup>
                            <col style={{ width: '9%' }} />
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '31%' }} />
                            <col style={{ width: '30%' }} />
                        </colgroup>

                        <thead>
                            <tr className="border-b border-[#E8DCE8] bg-[#F0E7F1] text-[#765C78]">
                                <th className="px-4 py-3 font-semibold">ID</th>
                                <th className="px-4 py-3 font-semibold">NOMBRE / EMAIL</th>
                                <th className="px-4 py-3 font-semibold">ROLES ASIGNADOS</th>
                                <th className="px-4 py-3 font-semibold text-center">ACCIONES</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-10 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-sm text-[#765C78]">
                                                No se encontraron usuarios que coincidan con los criterios.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-[#F0E7F1] last:border-0 hover:bg-[#FCF9FC] transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-[#987F98]">
                                            #{user.id}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">
                                                    {user.name}
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles.length === 0 ? (
                                                    <span className="text-xs italic text-gray-400">
                                                        Sin roles asignados
                                                    </span>
                                                ) : (
                                                    user.roles.map((role) => (
                                                        <Badge
                                                            key={role.id}
                                                            variant="outline"
                                                            className="bg-[#F8F3F8] text-[#765C78] border-[#E8DCE8] capitalize"
                                                        >
                                                            💼 {role.name}
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-1 whitespace-nowrap">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="h-8 bg-[#8C5770] hover:bg-[#75445C] text-white"
                                                    title="Ver detalles del usuario"
                                                >
                                                    <Link href={`/admin/users/${user.id}`}>
                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                        Ver
                                                    </Link>
                                                </Button>

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="h-8 bg-[#D5C5D9] hover:bg-[#C6B1CC] text-[#59465B]"
                                                    title="Editar usuario"
                                                >
                                                    <Link href={`/admin/users/${user.id}/edit`}>
                                                        <Pencil className="w-4 h-4 mr-1.5" />
                                                        Editar
                                                    </Link>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                    className="h-8 bg-[#F2BFBD] hover:bg-[#E9AAA7] text-[#754B4A]"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AlertDialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    if (isDeleting) return;

                    setIsModalOpen(open);

                    if (!open) {
                        setIdSeleccionado(null);
                    }
                }}
            >
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#F9DEDE] text-[#A34F4F] rounded-full">
                                <AlertTriangle className="w-5 h-5" />
                            </div>

                            <AlertDialogTitle className="text-xl">
                                ¿Eliminar usuario?
                            </AlertDialogTitle>
                        </div>

                        <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                            Estás a punto de borrar este usuario permanentemente.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="border-[#E8DCE8] text-[#765C78] hover:bg-[#F8F3F8]"
                        >
                            Volver
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                ejecutarEliminacion();
                            }}
                            className="bg-[#F2BFBD] hover:bg-[#E9AAA7] text-[#754B4A] font-medium shadow-xs transition-colors duration-200"
                        >
                            {isDeleting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Eliminando...</span>
                                </div>
                            ) : (
                                'Sí, eliminar usuario'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
