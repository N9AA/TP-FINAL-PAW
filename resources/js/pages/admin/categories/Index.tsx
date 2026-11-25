import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';

interface Category {
    id: number;
    name: string;
    estado: boolean;
    family: {
        id: number;
        name: string;
    } | null;
}

interface Family {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Filtros {
    buscar: string;
    familia: string;
    estado: string;
    orden: string;
    direccion: string;
    por_pagina: number;
}

interface Props {
    categories: {
        data: Category[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    families: Family[];
    filtros: Filtros;
}

export default function Index({ categories, families, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [familia, setFamilia] = useState(filtros.familia ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');

    const aplicarFiltros = (e: FormEvent) => {
        e.preventDefault();

        router.get('/admin/categories', {
            buscar,
            familia,
            estado,
            orden: filtros.orden,
            direccion: filtros.direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    // Limpiar filtros.
    const limpiarFiltros = () => {
        setBuscar('');
        setFamilia('');
        setEstado('');

        router.get('/admin/categories', {}, {
            preserveState: false,
            replace: true,
        });
    };

    const ordenarPor = (columna: string) => {
        const direccion =
            filtros.orden === columna && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get('/admin/categories', {
            buscar,
            familia,
            estado,
            orden: columna,
            direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const cambiarCantidad = (cantidad: number) => {
        router.get('/admin/categories', {
            buscar,
            familia,
            estado,
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
            text: '¿Deseás eliminar esta categoría?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F2BFBD',
            cancelButtonColor: '#8C5770',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/categories/${id}`);
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
                    name: 'Categorías',
                },
            ]}
            action={
                <Link
                    href="/admin/categories/create"
                    className="btn inline-flex items-center gap-2 bg-[#8C5770] text-white hover:bg-[#75445C] rounded-lg px-4 py-2 text-sm font-medium transition"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Nuevo
                </Link>
            }
        >
            <Head title="Categorías" />

            {/* Búsqueda y filtros */}
            <form
                onSubmit={aplicarFiltros}
                className="mb-4 flex flex-wrap items-center gap-2"
            >
                <input
                    type="text"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Buscar..."
                    className="border border-[#E8DCE8] rounded-lg px-3 py-2 w-full sm:w-56 text-sm text-[#59465B] outline-none focus:border-[#8C5770]"
                />

                <select
                    value={familia}
                    onChange={(e) => setFamilia(e.target.value)}
                    className="border border-[#E8DCE8] rounded-lg px-3 py-2 w-full sm:w-auto text-sm text-[#59465B] outline-none focus:border-[#8C5770]"
                >
                    <option value="">Todas las familias</option>

                    {families.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name}
                        </option>
                    ))}
                </select>

                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="border border-[#E8DCE8] rounded-lg px-3 py-2 w-full sm:w-auto text-sm text-[#59465B] outline-none focus:border-[#8C5770]"
                >
                    <option value="">Todos los estados</option>
                    <option value="1">Activas</option>
                    <option value="0">Inactivas</option>
                </select>

                <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#8C5770] text-white hover:bg-[#75445C] rounded-lg px-4 py-2 text-sm font-medium transition"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m21 21-4.5-4.5m2-5.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                        />
                    </svg>
                    Buscar
                </button>

                <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="inline-flex items-center gap-2 bg-[#8C5770] text-white hover:bg-[#75445C] rounded-lg px-4 py-2 text-sm font-medium transition"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"
                        />
                    </svg>
                    Limpiar
                </button>
            </form>

            {/* Cantidad de registros */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <label htmlFor="por_pagina">
                    Mostrar:
                </label>

                <select
                    id="por_pagina"
                    value={filtros.por_pagina}
                    onChange={(e) => cambiarCantidad(Number(e.target.value))}
                    className="border border-[#E8DCE8] rounded-lg px-3 py-2 text-sm text-[#59465B] outline-none focus:border-[#8C5770]"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>

                <span>registros por página</span>
            </div>

            {categories.data.length > 0 ? (
                <>
                    {/* Tabla */}
                    <div className="relative overflow-x-auto bg-white shadow-sm rounded-xl border border-[#E8DCE8]">
                        <table
                            className="table-fixed text-sm text-left rtl:text-right text-body"
                            style={{
                                width: 'max-content',
                                minWidth: 'max(100%, 750px)',
                            }}
                        >
                            <thead className="bg-[#F0E7F1] text-sm text-[#765C78] border-b border-[#E8DCE8]">
                                <tr className="bg-[#F0E7F1]">
                                    <th
                                        scope="col"
                                        className="w-[10%] px-4 sm:px-6 py-3 font-medium whitespace-nowrap bg-[#F0E7F1]"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('id')}
                                            className="font-medium hover:text-[#8C5770]"
                                        >
                                            ID {indicadorOrden('id')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="w-[25%] px-4 sm:px-6 py-3 font-medium whitespace-nowrap bg-[#F0E7F1]"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('name')}
                                            className="font-medium hover:text-[#8C5770]"
                                        >
                                            NOMBRE {indicadorOrden('name')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="w-[25%] px-4 sm:px-6 py-3 font-medium whitespace-nowrap bg-[#F0E7F1]"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('familia')}
                                            className="font-medium hover:text-[#8C5770]"
                                        >
                                            FAMILIA {indicadorOrden('familia')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="w-[15%] px-4 sm:px-6 py-3 font-medium whitespace-nowrap bg-[#F0E7F1]"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('estado')}
                                            className="font-medium hover:text-[#8C5770]"
                                        >
                                            ESTADO {indicadorOrden('estado')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="w-[25%] px-4 sm:px-6 py-3 font-medium whitespace-nowrap bg-[#F0E7F1]"
                                    >
                                        ACCIONES
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {categories.data.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="bg-white border-b border-[#F0E9F0] hover:bg-[#FCF9FC] transition"
                                    >
                                        <th
                                            scope="row"
                                            className="w-[10%] px-4 sm:px-6 py-4 font-medium text-heading whitespace-nowrap"
                                        >
                                            {category.id}
                                        </th>

                                        <td className="w-[25%] px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {category.name}
                                        </td>

                                        <td className="w-[25%] px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {category.family?.name ?? 'Sin familia'}
                                        </td>

                                        {/* Badge de estado */}
                                        <td className="w-[15%] px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    category.estado
                                                        ? 'bg-[#DDF2E3] text-[#39734B]'
                                                        : 'bg-[#F9DEDE] text-[#A34F4F]'
                                                }`}
                                            >
                                                {category.estado ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="w-[25%] px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/categories/${category.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D5C5D9] px-3 py-1.5 text-xs font-semibold text-[#59465B] transition hover:bg-[#C6B1CC]"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="m16.862 4.487 2.651 2.651M7 17l4-1 9-9a2.121 2.121 0 0 0-3-3l-9 9-1 4ZM5 21h14"
                                                        />
                                                    </svg>
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(category.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2BFBD] px-3 py-1.5 text-xs font-semibold text-[#754B4A] transition hover:bg-[#E9AAA7]"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M6 7h12m-10 0V5h8v2m-9 0 1 14h8l1-14M10 11v6m4-6v6"
                                                        />
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
                    <div className="mt-4 flex flex-wrap justify-center sm:justify-end gap-1">
                        {categories.links.map((link, index) => {
                            const label = link.label
                                .replace('Previous', 'Anterior')
                                .replace('Next', 'Siguiente');

                            return (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    className={`px-3 py-2 text-sm border border-[#E8DCE8] rounded-lg transition ${
                                        link.active
                                            ? 'bg-[#8C5770] border-[#8C5770] font-bold text-white'
                                            : 'bg-white text-[#765C78] hover:bg-[#F5EDF5]'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                </>
            ) : (
                <div
                    className="flex items-start sm:items-center p-4 text-sm text-[#765C78] rounded-xl border border-[#E8DCE8] bg-[#F8F3F8]"
                    role="alert"
                >
                    <svg
                        className="w-4 h-4 me-2 shrink-0 mt-0.5 sm:mt-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>

                    <p>
                        <span className="font-medium me-1">
                            Información:
                        </span>

                        {buscar.trim() !== '' || familia !== '' || estado !== ''
                            ? 'No se encontraron categorías con los filtros seleccionados.'
                            : 'Todavía no hay categorías registradas.'}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}