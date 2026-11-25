
import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import type { FormEvent } from 'react';

import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    Loader2,
    Search,
    X,
    Save,
    Pencil,
    Trash2,
    ShieldCheck,
} from 'lucide-react';

import FlashMessage from '@/components/FlashMessage';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
}

interface IndexProps {
    permissions: Permission[];
}

export default function Index({ permissions }: IndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
    });

    const limpiarFiltros = () => {
        setSearchQuery('');
        setActionFilter('all');
    };

    const startEdit = (permission: Permission) => {
        setEditingId(permission.id);
        setData('name', permission.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (editingId !== null) {
            put(`/admin/permissions/${editingId}`, {
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                },
            });
        } else {
            post('/admin/permissions', {
                onSuccess: () => reset(),
            });
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIdSeleccionado(id);
        setIsModalOpen(true);
    };

    const ejecutarEliminacion = () => {
        if (idSeleccionado === null) return;

        setIsDeleting(true);

        router.delete(`/admin/permissions/${idSeleccionado}`, {
            onSuccess: () => {
                setIsModalOpen(false);
                setIdSeleccionado(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const filteredPermissions = permissions.filter((perm) => {
        const matchesSearch = perm.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        if (actionFilter === 'all') return matchesSearch;

        return matchesSearch && perm.name.toLowerCase().startsWith(actionFilter);
    });

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Permisos' },
            ]}
        >
            <Head title="Permisos" />

            <div className="card space-y-6">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Lista de capacidades utilizadas para proteger las funciones
                        del sistema.
                    </p>
                </div>

                <FlashMessage />

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                    {/* FORMULARIO */}

                    <div className="space-y-5 rounded-xl border border-[#E8DCE8] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#F8F3F8] p-2 text-[#8C5770]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>

                            <h2 className="text-base font-semibold text-[#765C78]">
                                {editingId !== null
                                    ? 'Modificar permiso'
                                    : 'Registrar permiso'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-[#765C78]">
                                    NOMBRE DEL PERMISO
                                </label>

                                <Input
                                    placeholder="Ej: manage products"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="border-[#E8DCE8] focus-visible:ring-[#8C5770]"
                                />

                                {errors.name && (
                                    <p className="text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#8C5770] text-white hover:bg-[#75445C]"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {editingId !== null ? 'Actualizar' : 'Guardar'}
                                        </>
                                    )}
                                </Button>

                                {editingId !== null && (
                                    <Button
                                        type="button"
                                        onClick={cancelEdit}
                                        disabled={processing}
                                        className="bg-[#F2BFBD] text-[#754B4A] hover:bg-[#E9AAA7]"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* TABLA */}

                    <div className="space-y-4 lg:col-span-2">
                        {/* BUSCADOR Y FILTROS */}

                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                            <div className="relative w-full sm:flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B829C]" />

                                <Input
                                    placeholder="Buscar permiso..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 border-[#E8DCE8] pl-9 focus-visible:ring-[#8C5770]"
                                />
                            </div>

                            <div className="w-full sm:w-[165px]">
                                <Select
                                    value={actionFilter}
                                    onValueChange={setActionFilter}
                                >
                                    <SelectTrigger className="h-9 border-[#E8DCE8] focus:ring-[#8C5770]">
                                        <SelectValue placeholder="Filtrar" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos los permisos
                                        </SelectItem>

                                        <SelectItem value="manage">
                                            Gestionar
                                        </SelectItem>

                                        <SelectItem value="access">
                                            Acceso
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                onClick={limpiarFiltros}
                                className="h-9 w-full bg-[#8C5770] px-4 text-white hover:bg-[#75445C] sm:w-auto"
                            >
                                <X className="mr-1 h-4 w-4" />
                                Limpiar filtros
                            </Button>
                        </div>

                        {/* TABLA DE PERMISOS */}

                        <div className="relative overflow-x-auto rounded-lg border border-[#E8DCE8] bg-white shadow-sm">
                            <table
                                className="table-fixed text-left text-sm text-gray-700"
                                style={{
                                    width: 'max-content',
                                    minWidth: 'max(100%, 650px)',
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '43%' }} />
                                    <col style={{ width: '20%' }} />
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
                                            IDENTIFICADOR INTERNO
                                        </th>

                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left font-semibold"
                                        >
                                            GUARD
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
                                    {filteredPermissions.length === 0 ? (
                                        <tr className="bg-white">
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="rounded-full bg-[#F8F3F8] p-3">
                                                        <ShieldCheck className="h-6 w-6 text-[#B49BB5]" />
                                                    </div>

                                                    <p className="text-sm text-[#765C78]">
                                                        No se encontraron permisos.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPermissions.map((perm) => (
                                            <tr
                                                key={perm.id}
                                                className="border-b border-[#F0E7F1] bg-white transition-colors hover:bg-[#FCF9FC]"
                                            >
                                                <th
                                                    scope="row"
                                                    className="whitespace-nowrap px-4 py-4 font-mono text-sm text-[#8B778C]"
                                                >
                                                    #{perm.id}
                                                </th>

                                                <td className="px-4 py-4">
                                                    <span className="inline-flex max-w-full break-all rounded-md border border-[#E8DCE8] bg-[#F8F3F8] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#765C78]">
                                                        {perm.name}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-[#8B778C]">
                                                    {perm.guard_name}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => startEdit(perm)}
                                                            disabled={editingId === perm.id}
                                                            className="h-8 bg-[#D5C5D9] px-3 text-[#59465B] hover:bg-[#C6B1CC]"
                                                        >
                                                            <Pencil className="mr-1 h-3.5 w-3.5" />
                                                            Editar
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleDelete(perm.id)}
                                                            className="h-8 bg-[#F2BFBD] px-3 text-[#754B4A] hover:bg-[#E9AAA7]"
                                                        >
                                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
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

                        <div className="text-right text-xs text-[#8B778C]">
                            Resultados encontrados:{' '}
                            <strong className="text-[#765C78]">
                                {filteredPermissions.length}
                            </strong>{' '}
                            de {permissions.length}
                        </div>
                    </div>
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
                <AlertDialogContent className="border-[#E8DCE8] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-full bg-[#F9DEDE] p-2 text-[#A34F4F]">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <AlertDialogTitle className="text-xl text-[#59465B]">
                                ¿Eliminar permiso?
                            </AlertDialogTitle>
                        </div>

                        <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                            Estás a punto de borrar este permiso permanentemente.
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
                            className="bg-[#F2BFBD] font-medium text-[#754B4A] shadow-xs transition-colors duration-200 hover:bg-[#E9AAA7]"
                        >
                            {isDeleting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Eliminando...</span>
                                </div>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Sí, eliminar permiso
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
