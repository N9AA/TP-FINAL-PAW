
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
}

interface Driver {
    id: number;
    user: User;
    plate_number: string | null;
    type: number;
}

interface Shipment {
    id: number;
    status: number;
    driver: Driver | null;
}

interface Order {
    id: number;
    user: User | null;
    content: unknown[];
    total: number;
    status: number;
    created_at: string;
    shipments: Shipment[];
    pdf_path: string | null;
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
}

interface Props {
    orders: {
        data: Order[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    drivers: Driver[];
    filtros: Filtros;
}

const orderStatuses: Record<number, string> = {
    1: 'Pendiente',
    2: 'En preparación',
    3: 'Enviado',
    4: 'Completado',
    5: 'Fallido',
    6: 'Devuelto',
    7: 'Cancelado',
};

const shipmentStatuses: Record<number, string> = {
    1: 'Pendiente',
    2: 'Completado',
    3: 'Fallido',
};

const orderStatusClasses: Record<number, string> = {
    1: 'bg-[#FFF1D6] text-[#9A6B20]',
    2: 'bg-[#EEE5F0] text-[#765C78]',
    3: 'bg-[#DDEBF7] text-[#426B91]',
    4: 'bg-[#DDF2E3] text-[#39734B]',
    5: 'bg-[#F9DEDE] text-[#A34F4F]',
    6: 'bg-[#F2E3ED] text-[#8C5770]',
    7: 'bg-gray-100 text-gray-600',
};

const shipmentStatusClasses: Record<number, string> = {
    1: 'bg-[#FFF1D6] text-[#9A6B20]',
    2: 'bg-[#DDF2E3] text-[#39734B]',
    3: 'bg-[#F9DEDE] text-[#A34F4F]',
};

export default function Index({ orders, drivers, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar);
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        driver_id: '',
    });

    const aplicarFiltros = (valores: Partial<Filtros> = {}) => {
        router.get(
            '/admin/orders',
            {
                buscar,
                orden: filtros.orden,
                direccion: filtros.direccion,
                por_pagina: filtros.por_pagina,
                ...valores,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const buscarOrdenes = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        aplicarFiltros({ buscar });
    };

    const limpiarFiltros = () => {
        setBuscar('');

        router.get(
            '/admin/orders',
            {
                buscar: '',
                orden: 'id',
                direccion: 'desc',
                por_pagina: 10,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
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

    const changeStatus = async (
        orderId: number,
        action: 'processing' | 'refunded' | 'cancel',
    ) => {
        if (action === 'cancel') {
            const resultado = await Swal.fire({
                title: '¿Cancelar orden?',
                text: '¿Estás seguro de que deseas cancelar esta orden?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Volver',
                reverseButtons: true,
                confirmButtonColor: '#F2BFBD',
                cancelButtonColor: '#8C5770',
            });

            if (!resultado.isConfirmed) {
                return;
            }
        }

        router.patch(
            `/admin/orders/${orderId}/${action}`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const openShipmentModal = (orderId: number) => {
        setSelectedOrder(orderId);
        setIsModalOpen(true);
    };

    const closeShipmentModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        reset();
    };

    const assignDriver = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedOrder) return;

        post(`/admin/orders/${selectedOrder}/shipments`, {
            preserveScroll: true,
            onSuccess: () => closeShipmentModal(),
        });
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2,
        }).format(price);

    return (
        <AdminLayout
            breadcrumbs={[
                { name: 'Dashboard', route: '/admin' },
                { name: 'Órdenes' },
            ]}
        >
            <Head title="Órdenes" />

            <div className="space-y-5">
                {/* Búsqueda */}
                <form
                    onSubmit={buscarOrdenes}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar por ID o nombre del cliente..."
                        className="w-full rounded-lg border border-[#E5DCE5] bg-white px-3 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/10 sm:w-72"
                    />

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8C5770] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#75445C]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m3 6 3 0" />
                            <path d="m8 6 13 0" />
                            <path d="m5 6 2 14h10l2-14" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                        </svg>
                        Limpiar filtros
                    </button>
                </form>

                {/* Cantidad de registros */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="por_pagina"
                        className="text-sm font-medium text-gray-600"
                    >
                        Mostrar:
                    </label>

                    <select
                        id="por_pagina"
                        value={filtros.por_pagina}
                        onChange={(e) =>
                            cambiarCantidad(Number(e.target.value))
                        }
                        className="rounded-lg border border-[#E5DCE5] bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/10"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>

                    <span className="text-sm text-gray-500">
                        registros por página
                    </span>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto rounded-xl border border-[#E8DCE8] bg-white shadow-sm">
                    <table className="w-full min-w-[1250px] table-fixed text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#E8DCE8] bg-[#F0E7F1] text-xs font-semibold uppercase tracking-wide text-[#765C78]">
                                <th className="w-[7%] px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('id')}
                                        className="transition hover:text-[#8C5770]"
                                    >
                                        ID {indicadorOrden('id')}
                                    </button>
                                </th>

                                <th className="w-[17%] px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('cliente')}
                                        className="transition hover:text-[#8C5770]"
                                    >
                                        CLIENTE {indicadorOrden('cliente')}
                                    </button>
                                </th>

                                <th className="w-[12%] px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('total')}
                                        className="transition hover:text-[#8C5770]"
                                    >
                                        TOTAL {indicadorOrden('total')}
                                    </button>
                                </th>

                                <th className="w-[14%] px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() => ordenarPor('status')}
                                        className="transition hover:text-[#8C5770]"
                                    >
                                        ESTADO {indicadorOrden('status')}
                                    </button>
                                </th>

                                <th className="w-[15%] px-4 py-4">
                                    ENVÍO
                                </th>

                                <th className="w-[35%] px-4 py-4 text-center">
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#F0EAF0]">
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="transition hover:bg-[#FCFAFC]"
                                    >
                                        <td className="px-4 py-4 font-semibold text-[#765C78]">
                                            #{order.id}
                                        </td>

                                        <td className="break-words px-4 py-4 text-gray-700">
                                            {order.user?.name ?? 'Sin cliente'}
                                        </td>

                                        <td className="px-4 py-4 font-medium text-gray-700">
                                            {formatPrice(Number(order.total))}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                    orderStatusClasses[
                                                        Number(order.status)
                                                    ] ??
                                                    'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {orderStatuses[
                                                    Number(order.status)
                                                ] ?? 'Desconocido'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            {order.shipments?.length > 0 ? (
                                                <div className="space-y-1">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                            shipmentStatusClasses[
                                                                Number(
                                                                    order
                                                                        .shipments[0]
                                                                        .status,
                                                                )
                                                            ] ??
                                                            'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {shipmentStatuses[
                                                            Number(
                                                                order
                                                                    .shipments[0]
                                                                    .status,
                                                            )
                                                        ] ?? 'Desconocido'}
                                                    </span>

                                                    <p className="text-xs text-gray-500">
                                                        {order.shipments[0]
                                                            .driver?.user
                                                            ?.name ??
                                                            'Sin conductor'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Sin envío
                                                </span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-nowrap items-center justify-center gap-2">
                                                {Number(order.status) === 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changeStatus(
                                                                order.id,
                                                                'processing',
                                                            )
                                                        }
                                                        title="Listo para despachar"
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#8C5770] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#75445C]"
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
                                                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
                                                            <path d="m3.3 7 8.7 5 8.7-5" />
                                                            <path d="M12 22V12" />
                                                        </svg>
                                                        Despachar
                                                    </button>
                                                )}

                                                {Number(order.status) === 2 &&
                                                    order.shipments.length === 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openShipmentModal(
                                                                    order.id,
                                                                )
                                                            }
                                                            title="Asignar conductor"
                                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#8C5770] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#75445C]"
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
                                                                <path d="M10 17h4V5H2v12h3" />
                                                                <path d="M14 9h4l4 4v4h-3" />
                                                                <circle cx="7.5" cy="17.5" r="2.5" />
                                                                <circle cx="16.5" cy="17.5" r="2.5" />
                                                            </svg>
                                                            Conductor
                                                        </button>
                                                    )}

                                                {Number(order.status) === 5 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changeStatus(
                                                                order.id,
                                                                'refunded',
                                                            )
                                                        }
                                                        title="Marcar como devuelto"
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#8C5770] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#75445C]"
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
                                                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                                                            <path d="M3 3v5h5" />
                                                            <path d="M12 7v5l3 2" />
                                                        </svg>
                                                        Devolver
                                                    </button>
                                                )}

                                                {![
                                                    3, 4, 5, 6, 7,
                                                ].includes(Number(order.status)) &&
                                                    order.shipments.length === 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeStatus(
                                                                    order.id,
                                                                    'cancel',
                                                                )
                                                            }
                                                            title="Cancelar orden"
                                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F2BFBD] px-3 py-2 text-xs font-medium text-[#754B4A] transition hover:bg-[#E9AAA7]"
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
                                                                <circle cx="12" cy="12" r="10" />
                                                                <path d="m15 9-6 6" />
                                                                <path d="m9 9 6 6" />
                                                            </svg>
                                                            Cancelar
                                                        </button>
                                                    )}

                                                <a
                                                    href={`/admin/orders/${order.id}/ticket`}
                                                    title="Descargar ticket"
                                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#D5C5D9] px-3 py-2 text-xs font-medium text-[#59465B] transition hover:bg-[#C6B1CC]"
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
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <path d="m7 10 5 5 5-5" />
                                                        <path d="M12 15V3" />
                                                    </svg>
                                                    Ticket
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10">
                                        <div className="rounded-lg border border-[#E8DCE8] bg-[#F8F3F8] p-6 text-center text-sm text-[#765C78]">
                                            {filtros.buscar
                                                ? 'No se encontraron órdenes con ese criterio de búsqueda.'
                                                : 'No hay órdenes registradas.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-sm text-gray-500">
                        Mostrando {orders.from ?? 0} a {orders.to ?? 0} de{' '}
                        {orders.total} órdenes
                    </p>

                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {orders.links.map((link, index) => {
                            const label = link.label
                                .replace('&laquo;', '«')
                                .replace('&raquo;', '»')
                                .replace('Previous', 'Anterior')
                                .replace('Next', 'Siguiente');

                            return (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                                        link.active
                                            ? 'border-[#8C5770] bg-[#8C5770] text-white'
                                            : 'border-[#E8DCE8] bg-white text-[#765C78] hover:bg-[#F8F3F8]'
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

            {/* Modal para asignar conductor */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl border border-[#E8DCE8] bg-white p-6 shadow-xl">
                        <h2 className="mb-5 text-lg font-semibold text-[#765C78]">
                            Asignar conductor
                        </h2>

                        <form onSubmit={assignDriver}>
                            <label
                                htmlFor="driver_id"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Seleccionar conductor
                            </label>

                            <select
                                id="driver_id"
                                value={data.driver_id}
                                onChange={(e) =>
                                    setData('driver_id', e.target.value)
                                }
                                className="w-full rounded-lg border border-[#E5DCE5] bg-white p-2.5 text-sm text-gray-700 outline-none transition focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/10"
                            >
                                <option value="">
                                    Seleccioná un conductor
                                </option>

                                {drivers.map((driver) => (
                                    <option
                                        key={driver.id}
                                        value={driver.id}
                                    >
                                        {driver.user?.name ?? 'Sin usuario'}
                                        {driver.plate_number
                                            ? ` - ${driver.plate_number}`
                                            : ''}
                                    </option>
                                ))}
                            </select>

                            {errors.driver_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.driver_id}
                                </p>
                            )}

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeShipmentModal}
                                    className="rounded-lg bg-[#F2BFBD] px-4 py-2 text-sm font-medium text-[#754B4A] transition hover:bg-[#E9AAA7]"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing || !data.driver_id}
                                    className="rounded-lg bg-[#8C5770] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#75445C] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Asignando...'
                                        : 'Asignar conductor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
