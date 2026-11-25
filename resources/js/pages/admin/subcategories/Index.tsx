import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';

interface Subcategory {
    id: number;
    name: string;
    estado: boolean;
    category: {
        id: number;
        name: string;
        family: {
            id: number;
            name: string;
        } | null;
    } | null;
}

interface Category {
    id: number;
    name: string;
    family_id: number;
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
    categoria: string;
    familia: string;
    estado: string;
    orden: string;
    direccion: string;
    por_pagina: number;
}

interface Props {
    subcategories: {
        data: Subcategory[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    categories: Category[];
    families: Family[];
    filtros: Filtros;
}

export default function Index({
    subcategories,
    categories,
    families,
    filtros,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [categoria, setCategoria] = useState(filtros.categoria ?? '');
    const [familia, setFamilia] = useState(filtros.familia ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');

    const aplicarFiltros = (e: FormEvent) => {
        e.preventDefault();

        router.get('/admin/subcategories', {
            buscar,
            categoria,
            familia,
            estado,
            orden: filtros.orden,
            direccion: filtros.direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const limpiarFiltros = () => {
        setBuscar('');
        setCategoria('');
        setFamilia('');
        setEstado('');

        router.get(
            '/admin/subcategories',
            {},
            {
                preserveState: false,
                replace: true,
            },
        );
    };

    const ordenarPor = (columna: string) => {
        const direccion =
            filtros.orden === columna && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get('/admin/subcategories', {
            buscar,
            categoria,
            familia,
            estado,
            orden: columna,
            direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const cambiarCantidad = (cantidad: number) => {
        router.get('/admin/subcategories', {
            buscar,
            categoria,
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
            text: '¿Deseás eliminar esta subcategoría?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F2BFBD',
            cancelButtonColor: '#8C5770',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/subcategories/${id}`);
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
                    name: 'Subcategorías',
                },
            ]}
            action={
                <Link
                    href="/admin/subcategories/create"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: '#8C5770' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#75445C';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8C5770';
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Nuevo
                </Link>
            }
        >
            <Head title="Subcategorías" />

            {/* Búsqueda y filtros */}
            <form
                onSubmit={aplicarFiltros}
                className="mb-5 flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center"
            >
                <input
                    type="text"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Buscar subcategoría..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770] sm:w-56"
                />

                <select
                    value={familia}
                    onChange={(e) => {
                        setFamilia(e.target.value);
                        setCategoria('');
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770] sm:w-auto"
                >
                    <option value="">Todas las familias</option>

                    {families.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name}
                        </option>
                    ))}
                </select>

                <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770] sm:w-auto"
                >
                    <option value="">Todas las categorías</option>

                    {categories
                        .filter(
                            (c) =>
                                !familia ||
                                c.family_id === Number(familia),
                        )
                        .map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                </select>

                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770] sm:w-auto"
                >
                    <option value="">Todos los estados</option>
                    <option value="1">Activas</option>
                    <option value="0">Inactivas</option>
                </select>

                <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors sm:w-auto"
                    style={{ backgroundColor: '#8C5770' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#75445C';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8C5770';
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m20 20-4-4"
                        />
                    </svg>
                    Buscar
                </button>

                <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors sm:w-auto"
                    style={{ backgroundColor: '#8C5770' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#75445C';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8C5770';
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5"
                        />
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
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>

                <span>registros por página</span>
            </div>

            {subcategories.data.length > 0 ? (
                <>
                    {/* Tabla */}
                    <div className="relative overflow-x-auto rounded-lg border border-[#E8DCE8] bg-white shadow-sm">
                        <table
                            className="table-fixed text-left text-sm text-gray-700"
                            style={{
                                width: 'max-content',
                                minWidth: 'max(100%, 850px)',
                            }}
                        >
                            <colgroup>
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '22%' }} />
                                <col style={{ width: '22%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '13%' }} />
                                <col style={{ width: '15%' }} />
                            </colgroup>

                            <thead>
                                <tr className="border-b border-[#E8DCE8] bg-[#F0E7F1] text-[#765C78]">
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('id')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            ID {indicadorOrden('id')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('name')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            NOMBRE {indicadorOrden('name')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('categoria')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            CATEGORÍA {indicadorOrden('categoria')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('familia')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            FAMILIA {indicadorOrden('familia')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('estado')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            ESTADO {indicadorOrden('estado')}
                                        </button>
                                    </th>

                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        ACCIONES
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {subcategories.data.map((subcategory) => (
                                    <tr
                                        key={subcategory.id}
                                        className="border-b border-gray-100 bg-white transition-colors hover:bg-[#FCF9FC]"
                                    >
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-4 py-4 font-medium text-gray-700"
                                        >
                                            {subcategory.id}
                                        </th>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            {subcategory.name}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            {subcategory.category?.name ?? 'Sin categoría'}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            {subcategory.category?.family?.name ?? 'Sin familia'}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                    subcategory.estado
                                                        ? 'bg-[#DDF2E3] text-[#39734B]'
                                                        : 'bg-[#F9DEDE] text-[#A34F4F]'
                                                }`}
                                            >
                                                {subcategory.estado ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/subcategories/${subcategory.id}/edit`}
                                                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-[#59465B] transition-colors"
                                                    style={{
                                                        backgroundColor: '#D5C5D9',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#C6B1CC';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#D5C5D9';
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3.5 w-3.5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z"
                                                        />
                                                    </svg>
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(subcategory.id)}
                                                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-[#754B4A] transition-colors"
                                                    style={{
                                                        backgroundColor: '#F2BFBD',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#E9AAA7';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#F2BFBD';
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3.5 w-3.5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5"
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

                    {/* Información de registros */}
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {subcategories.from} a {subcategories.to} de{' '}
                        {subcategories.total} subcategorías
                    </div>

                    {/* Paginación */}
                    <div className="mt-4 flex flex-wrap justify-center gap-1 sm:justify-end">
                        {subcategories.links.map((link, index) => {
                            const label = link.label
                                .replace('Previous', 'Anterior')
                                .replace('Next', 'Siguiente');

                            return (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                                        link.active
                                            ? 'border-[#8C5770] bg-[#8C5770] font-semibold text-white'
                                            : 'border-[#E8DCE8] bg-white text-[#765C78] hover:bg-[#F5EDF5]'
                                    } ${
                                        !link.url
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                </>
            ) : (
                <div
                    className="rounded-lg border border-[#E8DCE8] bg-[#F8F3F8] p-4 text-sm text-[#765C78]"
                    role="alert"
                >
                    <p>
                        <span className="me-1 font-semibold">
                            Información:
                        </span>

                        {buscar.trim() !== '' ||
                        categoria !== '' ||
                        familia !== '' ||
                        estado !== ''
                            ? 'No se encontraron subcategorías con los filtros seleccionados.'
                            : 'Todavía no hay subcategorías registradas.'}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}