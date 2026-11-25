
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
}

interface Driver {
    id: number;
    user: User;
    type: number;
    plate_number: string | null;
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
    drivers: {
        data: Driver[];
        links: PaginationLink[];
    };
    filtros: Filtros;
}

export default function Index({ drivers, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const aplicarFiltros = (e: FormEvent) => {
        e.preventDefault();

        router.get('/admin/drivers', {
            buscar,
            orden: filtros.orden,
            direccion: filtros.direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const limpiarFiltros = () => {
        setBuscar('');

        router.get('/admin/drivers', {
            buscar: '',
            orden: 'id',
            direccion: 'desc',
            por_pagina: 10,
        });
    };

    const ordenarPor = (columna: string) => {
        const direccion =
            filtros.orden === columna && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get('/admin/drivers', {
            buscar,
            orden: columna,
            direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const cambiarCantidad = (cantidad: number) => {
        router.get('/admin/drivers', {
            buscar,
            orden: filtros.orden,
            direccion: filtros.direccion,
            por_pagina: cantidad,
        });
    };

    const indicadorOrden = (columna: string) => {
        if (filtros.orden !== columna) {
            return '↕';
        }

        return filtros.direccion === 'asc' ? '↑' : '↓';
    };

    const eliminar = (id: number) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseás eliminar este conductor?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F2BFBD',
            cancelButtonColor: '#8C5770',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: '!text-[#754B4A]',
                cancelButton: '!text-white',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/drivers/${id}`);
            }
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Conductores',
                },
            ]}
            action={
                <Link
                    href="/admin/drivers/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#8C5770] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#75445C]"
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
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Nuevo
                </Link>
            }
        >
            <Head title="Conductores" />

            {/* Búsqueda */}
            <form
                onSubmit={aplicarFiltros}
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
                        placeholder="Buscar por ID o nombre..."
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

            {/* Cantidad de registros */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
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

            {drivers.data.length > 0 ? (
                <>
                    {/* Tabla */}
                    <div className="relative overflow-x-auto rounded-xl border border-[#E8DCE8] bg-white shadow-sm">
                        <table className="w-full min-w-[850px] table-fixed text-left text-sm">
                            <thead className="border-b border-[#E8DCE8] bg-[#F0E7F1] text-[#765C78]">
                                <tr>
                                    <th className="w-[10%] px-4 py-3 font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('id')}
                                            className="whitespace-nowrap transition hover:text-[#8C5770]"
                                        >
                                            ID {indicadorOrden('id')}
                                        </button>
                                    </th>

                                    <th className="w-[25%] px-4 py-3 font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('name')}
                                            className="whitespace-nowrap transition hover:text-[#8C5770]"
                                        >
                                            NOMBRE {indicadorOrden('name')}
                                        </button>
                                    </th>

                                    <th className="w-[15%] px-4 py-3 font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('type')}
                                            className="whitespace-nowrap transition hover:text-[#8C5770]"
                                        >
                                            TIPO {indicadorOrden('type')}
                                        </button>
                                    </th>

                                    <th className="w-[20%] px-4 py-3 font-semibold">
                                        PATENTE
                                    </th>

                                    <th className="w-[30%] px-4 py-3 text-center font-semibold">
                                        ACCIONES
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {drivers.data.map((driver) => (
                                    <tr
                                        key={driver.id}
                                        className="border-b border-[#F0E7F1] transition hover:bg-[#FCF9FC]"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                                            {driver.id}
                                        </td>

                                        <td className="truncate px-4 py-4 text-gray-700">
                                            {driver.user?.name ?? 'Sin usuario'}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                                            {driver.type}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                                            {driver.plate_number ?? '-'}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/admin/drivers/${driver.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D5C5D9] px-3 py-2 text-xs font-medium text-[#59465B] transition hover:bg-[#C6B1CC]"
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
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                                    </svg>
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(driver.id)}
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
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4h8v2" />
                                                        <path d="m19 6-1 14H6L5 6" />
                                                        <path d="M10 11v5M14 11v5" />
                                                    </svg>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="mt-5 flex flex-wrap justify-center gap-1 sm:justify-end">
                        {drivers.links.map((link, index) => {
                            const label = link.label
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
                </>
            ) : (
                <div
                    className="flex items-start gap-2 rounded-xl border border-[#E8DCE8] bg-[#F8F3F8] p-4 text-sm text-[#765C78] sm:items-center"
                    role="alert"
                >
                    <svg
                        className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>

                    <p>
                        <span className="me-1 font-semibold">
                            Información:
                        </span>

                        {buscar.trim() !== ''
                            ? 'No se encontraron conductores con la búsqueda seleccionada.'
                            : 'Todavía no hay conductores registrados.'}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
