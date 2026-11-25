
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/use-auth';

interface User {
    id: number;
    name: string;
}

interface Order {
    id: number;
    user: User;
}

interface Driver {
    id: number;
    user: User;
    plate_number: string | null;
}

interface Shipment {
    id: number;
    order: Order | null;
    driver: Driver | null;
    status: number;
    delivered_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Filtros {
    buscar: string;
    orden: string;
    direccion: string;
    por_pagina: number;
    status: string | null;
}

interface Props {
    shipments: {
        data: Shipment[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filtros: Filtros;
}

const statusLabels: Record<number, string> = {
    1: 'Pendiente',
    2: 'Completado',
    3: 'Fallido',
};

const statusClasses: Record<number, string> = {
    1: 'bg-[#FFF1D6] text-[#946B22]',
    2: 'bg-[#DDF2E3] text-[#39734B]',
    3: 'bg-[#F9DEDE] text-[#A34F4F]',
};

export default function Index({ shipments, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar);

    const { can } = useAuth();

    const aplicarFiltros = (valores: Partial<Filtros>) => {
        router.get(
            '/admin/shipments',
            {
                buscar,
                orden: filtros.orden,
                direccion: filtros.direccion,
                por_pagina: filtros.por_pagina,
                status: filtros.status ?? '',
                ...valores,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const buscarEnvios = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        aplicarFiltros({ buscar });
    };

    const limpiarFiltros = () => {
        setBuscar('');

        router.get(
            '/admin/shipments',
            {
                buscar: '',
                orden: 'id',
                direccion: 'desc',
                por_pagina: 10,
                status: '',
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const cambiarEstado = (status: string) => {
        aplicarFiltros({ status });
    };

    const cambiarCantidad = (cantidad: number) => {
        aplicarFiltros({ por_pagina: cantidad });
    };

    const ordenarPor = (columna: string) => {
        const direccion =
            filtros.orden === columna && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        aplicarFiltros({
            orden: columna,
            direccion,
        });
    };

    const indicadorOrden = (columna: string) => {
        if (filtros.orden !== columna) {
            return '↕';
        }

        return filtros.direccion === 'asc' ? '↑' : '↓';
    };

    const actualizarEnvio = async (
        id: number,
        accion: 'completed' | 'failed',
    ) => {
        const esCompletado = accion === 'completed';

        const resultado = await Swal.fire({
            title: esCompletado
                ? '¿Completar envío?'
                : '¿Marcar envío como fallido?',
            text: esCompletado
                ? 'Se actualizará el estado del envío y de la orden.'
                : 'Se marcará el envío y la orden como fallidos.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#8C5770',
            cancelButtonColor: '#F2BFBD',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            customClass: {
                confirmButton: '!text-white',
                cancelButton: '!text-[#754B4A]',
            },
        });

        if (resultado.isConfirmed) {
            router.patch(`/admin/shipments/${id}/${accion}`);
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Envíos' },
            ]}
        >
            <Head title="Envíos" />

            <div className="space-y-4">
                {/* Búsqueda */}
                <form
                    onSubmit={buscarEnvios}
                    className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <div className="relative w-full sm:max-w-xs">
                        <svg
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8299]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>

                        <input
                            type="text"
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                            placeholder="Buscar envío, orden, cliente o conductor..."
                            className="w-full rounded-lg border border-[#E5D9E6] bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#8C5770] focus:ring-1 focus:ring-[#8C5770]"
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8C5770] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#75445C]"
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        Buscar
                    </button>

                    <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8C5770] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#75445C]"
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="m19 6-1 14H6L5 6" />
                            <path d="M10 11v5M14 11v5" />
                        </svg>
                        Limpiar filtros
                    </button>
                </form>

                {/* Cantidad de registros y filtro por estado */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <label htmlFor="por_pagina">Mostrar:</label>

                        <select
                            id="por_pagina"
                            value={filtros.por_pagina}
                            onChange={(e) =>
                                cambiarCantidad(Number(e.target.value))
                            }
                            className="rounded-lg border border-[#E5D9E6] bg-white px-3 py-2 text-sm outline-none focus:border-[#8C5770]"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>

                        <span>registros por página</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <label htmlFor="status">Filtrar por estado:</label>

                        <select
                            id="status"
                            value={filtros.status ?? ''}
                            onChange={(e) => cambiarEstado(e.target.value)}
                            className="rounded-lg border border-[#E5D9E6] bg-white px-3 py-2 text-sm outline-none focus:border-[#8C5770]"
                        >
                            <option value="">Todos</option>
                            <option value="1">Pendientes</option>
                            <option value="2">Completados</option>
                            <option value="3">Fallidos</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="relative overflow-x-auto rounded-xl border border-[#E8DCE8] bg-white shadow-sm">
                    <table className="w-full min-w-[1200px] table-fixed text-left text-sm">
                        <thead className="border-b border-[#E8DCE8] bg-[#F0E7F1] text-[#765C78]">
                            <tr>
                                <th className="w-[10%] px-4 py-3 font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('id')}
                                        className="whitespace-nowrap transition hover:text-[#8C5770]"
                                    >
                                        ENVÍO {indicadorOrden('id')}
                                    </button>
                                </th>

                                <th className="w-[10%] px-4 py-3 font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('order_id')}
                                        className="whitespace-nowrap transition hover:text-[#8C5770]"
                                    >
                                        ORDEN {indicadorOrden('order_id')}
                                    </button>
                                </th>

                                <th className="w-[19%] px-4 py-3 font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('cliente')}
                                        className="whitespace-nowrap transition hover:text-[#8C5770]"
                                    >
                                        CLIENTE {indicadorOrden('cliente')}
                                    </button>
                                </th>

                                <th className="w-[19%] px-4 py-3 font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('conductor')}
                                        className="whitespace-nowrap transition hover:text-[#8C5770]"
                                    >
                                        CONDUCTOR {indicadorOrden('conductor')}
                                    </button>
                                </th>

                                <th className="w-[13%] px-4 py-3 font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('patente')}
                                        className="whitespace-nowrap transition hover:text-[#8C5770]"
                                    >
                                        PATENTE {indicadorOrden('patente')}
                                    </button>
                                </th>

                                <th className="w-[13%] px-4 py-3 font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('status')}
                                        className="whitespace-nowrap transition hover:text-[#8C5770]"
                                    >
                                        ESTADO {indicadorOrden('status')}
                                    </button>
                                </th>

                                <th className="w-[16%] px-4 py-3 text-center font-semibold">
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {shipments.data.length > 0 ? (
                                shipments.data.map((shipment) => (
                                    <tr
                                        key={shipment.id}
                                        className="border-b border-[#F0E7F1] transition hover:bg-[#FCF9FC]"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                                            #{shipment.id}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                                            #{shipment.order?.id ?? '-'}
                                        </td>

                                        <td className="truncate px-4 py-4 text-gray-700">
                                            {shipment.order?.user?.name ?? '-'}
                                        </td>

                                        <td className="truncate px-4 py-4 text-gray-700">
                                            {shipment.driver?.user?.name ?? '-'}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                                            {shipment.driver?.plate_number ?? '-'}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    statusClasses[
                                                        Number(shipment.status)
                                                    ] ??
                                                    'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {statusLabels[
                                                    Number(shipment.status)
                                                ] ?? 'Desconocido'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                {can('update shipments') &&
                                                Number(shipment.status) === 1 ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                actualizarEnvio(
                                                                    shipment.id,
                                                                    'completed',
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDF2E3] px-3 py-2 text-xs font-medium text-[#39734B] transition hover:bg-[#CBE9D3]"
                                                        >
                                                            <svg
                                                                className="h-3.5 w-3.5"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="m5 12 4 4L19 6" />
                                                            </svg>
                                                            Completar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                actualizarEnvio(
                                                                    shipment.id,
                                                                    'failed',
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2BFBD] px-3 py-2 text-xs font-medium text-[#754B4A] transition hover:bg-[#E9AAA7]"
                                                        >
                                                            <svg
                                                                className="h-3.5 w-3.5"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M18 6 6 18M6 6l12 12" />
                                                            </svg>
                                                            Fallido
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        Sin acciones
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8">
                                        <div className="flex items-center gap-2 rounded-xl border border-[#E8DCE8] bg-[#F8F3F8] p-4 text-sm text-[#765C78]">
                                            <svg
                                                className="h-5 w-5 shrink-0"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>

                                            <p>
                                                {filtros.buscar ||
                                                (filtros.status !== null &&
                                                    filtros.status !== '')
                                                    ? 'No se encontraron envíos con los filtros aplicados.'
                                                    : 'No hay envíos registrados.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-sm text-gray-600">
                        Mostrando {shipments.from ?? 0} a {shipments.to ?? 0} de{' '}
                        {shipments.total} envíos
                    </p>

                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {shipments.links.map((link, index) => {
                            const label = link.label
                                .replace('&laquo;', '«')
                                .replace('&raquo;', '»')
                                .replace('Previous', 'Anterior')
                                .replace('Next', 'Siguiente');

                            return (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                                        link.active
                                            ? 'border-[#8C5770] bg-[#8C5770] font-semibold text-white'
                                            : 'border-[#E5D9E6] bg-white text-[#765C78] hover:bg-[#F0E7F1]'
                                    } ${
                                        !link.url
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: label,
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
