import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';

interface Subcategory {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    subcategories: Subcategory[];
}

interface Family {
    id: number;
    name: string;
    categories: Category[];
}

interface Product {
    id: number;
    sku: string;
    name: string;
    image: string | null;
    price: number;
    estado: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Filtros {
    buscar: string;
    familia: string;
    categoria: string;
    subcategoria: string;
    estado: string;
    precio_min: string;
    precio_max: string;
    orden: string;
    direccion: string;
    por_pagina: number;
}

interface Props {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    families: Family[];
    filtros: Filtros;
}

export default function Index({ products, families, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [familia, setFamilia] = useState(filtros.familia ?? '');
    const [categoria, setCategoria] = useState(filtros.categoria ?? '');
    const [subcategoria, setSubcategoria] = useState(filtros.subcategoria ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [precioMin, setPrecioMin] = useState(filtros.precio_min ?? '');
    const [precioMax, setPrecioMax] = useState(filtros.precio_max ?? '');

    const rangoPrecioInvalido =
        precioMin !== '' &&
        precioMax !== '' &&
        Number(precioMax) <= Number(precioMin);

    const categorias = familia
        ? families.find((f) => f.id.toString() === familia)?.categories ?? []
        : families.flatMap((f) => f.categories);

    const subcategorias = categorias.find(
        (c) => c.id.toString() === categoria,
    )?.subcategories ?? [];

    const aplicarFiltros = (e: FormEvent) => {
        e.preventDefault();

        if (rangoPrecioInvalido) {
            return;
        }

        router.get('/admin/products', {
            buscar,
            familia,
            categoria,
            subcategoria,
            estado,
            precio_min: precioMin,
            precio_max: precioMax,
            orden: filtros.orden,
            direccion: filtros.direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const limpiarFiltros = () => {
        setBuscar('');
        setFamilia('');
        setCategoria('');
        setSubcategoria('');
        setEstado('');
        setPrecioMin('');
        setPrecioMax('');

        router.get(
            '/admin/products',
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

        router.get('/admin/products', {
            buscar,
            familia,
            categoria,
            subcategoria,
            estado,
            precio_min: precioMin,
            precio_max: precioMax,
            orden: columna,
            direccion,
            por_pagina: filtros.por_pagina,
        });
    };

    const cambiarCantidad = (cantidad: number) => {
        router.get('/admin/products', {
            buscar,
            familia,
            categoria,
            subcategoria,
            estado,
            precio_min: precioMin,
            precio_max: precioMax,
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
            text: '¿Deseás eliminar este producto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F2BFBD',
            cancelButtonColor: '#8C5770',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/products/${id}`);
            }
        });
    };

    // Construir la URL de exportación con los filtros aplicados.
    const parametrosExportacion = new URLSearchParams({
        buscar: filtros.buscar,
        familia: filtros.familia,
        categoria: filtros.categoria,
        subcategoria: filtros.subcategoria,
        estado: filtros.estado,
        precio_min: filtros.precio_min,
        precio_max: filtros.precio_max,
        orden: filtros.orden,
        direccion: filtros.direccion,
    });

    const urlExportacion = `/admin/products/export?${parametrosExportacion.toString()}`;

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Productos',
                },
            ]}
            action={
                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={urlExportacion}
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
                                d="M12 16V4m0 12 4-4m-4 4-4-4M4 20h16"
                            />
                        </svg>
                        Exportar Excel
                    </a>

                    <Link
                        href="/admin/products/create"
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
                </div>
            }
        >
            <Head title="Productos" />

            {/* Búsqueda y filtros */}
            <form
                onSubmit={aplicarFiltros}
                className="mb-5 flex flex-col gap-3"
            >
                <input
                    type="text"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Buscar por nombre o código..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770] sm:w-72"
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <select
                        value={familia}
                        onChange={(e) => {
                            setFamilia(e.target.value);
                            setCategoria('');
                            setSubcategoria('');
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
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
                        onChange={(e) => {
                            setCategoria(e.target.value);
                            setSubcategoria('');
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                    >
                        <option value="">Todas las categorías</option>

                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={subcategoria}
                        onChange={(e) => setSubcategoria(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                    >
                        <option value="">Todas las subcategorías</option>

                        {subcategorias.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                    >
                        <option value="">Todos los estados</option>
                        <option value="1">Activos</option>
                        <option value="0">Inactivos</option>
                    </select>

                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                        placeholder="Precio mínimo"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                    />

                    <div>
                        <input
                            type="number"
                            min={precioMin !== '' ? Number(precioMin) + 1 : 0}
                            step="1"
                            value={precioMax}
                            onChange={(e) => setPrecioMax(e.target.value)}
                            placeholder="Precio máximo"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                        />

                        {rangoPrecioInvalido && (
                            <p className="mt-1 text-sm text-red-600">
                                El precio máximo debe ser mayor que el mínimo.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:flex-row">
                    <button
                        type="submit"
                        disabled={rangoPrecioInvalido}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        style={{ backgroundColor: '#8C5770' }}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = '#75445C';
                            }
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
                </div>
            </form>

            {/* Cantidad de registros */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <label htmlFor="por_pagina">Mostrar:</label>

                <select
                    id="por_pagina"
                    value={filtros.por_pagina}
                    onChange={(e) => cambiarCantidad(Number(e.target.value))}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8C5770] focus:ring-[#8C5770]"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>

                <span>registros por página</span>
            </div>

            {products.data.length > 0 ? (
                <>
                    {/* Tabla */}
                    <div className="relative overflow-x-auto rounded-lg border border-[#E8DCE8] bg-white shadow-sm">
                        <table
                            className="table-fixed text-left text-sm text-gray-700"
                            style={{
                                width: 'max-content',
                                minWidth: 'max(100%, 1050px)',
                            }}
                        >
                            <colgroup>
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '13%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '18%' }} />
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
                                        IMAGEN
                                    </th>

                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => ordenarPor('sku')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            SKU {indicadorOrden('sku')}
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
                                            onClick={() => ordenarPor('price')}
                                            className="font-semibold transition-colors hover:text-[#8C5770]"
                                        >
                                            PRECIO {indicadorOrden('price')}
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
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-gray-100 bg-white transition-colors hover:bg-[#FCF9FC]"
                                    >
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-4 py-4 font-medium text-gray-700"
                                        >
                                            {product.id}
                                        </th>

                                        <td className="px-4 py-4">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-14 w-14 rounded-md border border-[#E8DCE8] object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Sin imagen
                                                </span>
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            {product.sku}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="line-clamp-2">
                                                {product.name}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            ${Number(product.price).toLocaleString('es-AR')}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                    product.estado
                                                        ? 'bg-[#DDF2E3] text-[#39734B]'
                                                        : 'bg-[#F9DEDE] text-[#A34F4F]'
                                                }`}
                                            >
                                                {product.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md bg-[#8C5770] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#75445C]"
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
                                                            d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                                                        />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    Ver
                                                </Link>

                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
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
                                                    onClick={() => eliminar(product.id)}
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
                        Mostrando {products.from} a {products.to} de{' '}
                        {products.total} productos
                    </div>

                    {/* Paginación */}
                    <div className="mt-4 flex flex-wrap justify-center gap-1 sm:justify-end">
                        {products.links.map((link, index) => {
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
                        familia !== '' ||
                        categoria !== '' ||
                        subcategoria !== '' ||
                        estado !== '' ||
                        precioMin !== '' ||
                        precioMax !== ''
                            ? 'No se encontraron productos con los filtros seleccionados.'
                            : 'Todavía no hay productos registrados.'}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}