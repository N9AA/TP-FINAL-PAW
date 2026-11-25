import { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sortable from 'sortablejs';
import axios from 'axios';
import AdminLayout from '@/layouts/admin-layout';

interface Cover {
    id: number;
    image: string;
    title: string;
    start_at: string;
    end_at: string | null;
    is_active: boolean;
}

interface Props {
    covers: Cover[];
}

function formatDate(date: string | null) {
    if (!date) return '-';

    const [year, month, day] = date.slice(0, 10).split('-');

    return `${day}/${month}/${year}`;
}

export default function Index({ covers }: Props) {
    const coversRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (!coversRef.current || covers.length === 0) return;

        const sortable = Sortable.create(coversRef.current, {
            animation: 150,
            ghostClass: 'bg-[#F0E7F1]',

            onEnd: () => {
                const sorts = sortable.toArray();

                axios
                    .post('/api/sort/covers', {
                        sorts: sorts,
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
        });

        return () => {
            sortable.destroy();
        };
    }, [covers.length]);

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Portadas',
                },
            ]}
            action={
                <Link
                    href="/admin/covers/create"
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
            <Head title="Portadas" />

            {/* Listado */}
            <ul
                className="space-y-4"
                id="covers"
                ref={coversRef}
            >
                {covers.length === 0 ? (
                    <li className="rounded-lg border border-[#E8DCE8] bg-[#F8F3F8] p-6 text-center text-sm text-[#765C78]">
                        No hay portadas registradas.
                    </li>
                ) : (
                    covers.map((cover) => (
                        <li
                            key={cover.id}
                            data-id={cover.id}
                            className="cursor-move overflow-hidden rounded-xl border border-[#E8DCE8] bg-white shadow-sm transition-shadow hover:shadow-md lg:flex"
                        >
                            <div className="flex items-center justify-center bg-[#F8F3F8] lg:w-64 lg:shrink-0">
                                <img
                                    src={cover.image}
                                    alt={cover.title}
                                    className="aspect-[3/1] w-full object-cover object-center lg:aspect-auto lg:h-full lg:min-h-36"
                                />
                            </div>

                            <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                                {/* Título y estado */}
                                <div className="min-w-0 space-y-2">
                                    <h2 className="font-semibold text-gray-800">
                                        {cover.title}
                                    </h2>

                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                            cover.is_active
                                                ? 'bg-[#DDF2E3] text-[#39734B]'
                                                : 'bg-[#F9DEDE] text-[#A34F4F]'
                                        }`}
                                    >
                                        {cover.is_active ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>

                                {/* Fecha de inicio */}
                                <div className="min-w-32">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#765C78]">
                                        Fecha de inicio
                                    </p>

                                    <p className="text-sm text-gray-700">
                                        {formatDate(cover.start_at)}
                                    </p>
                                </div>

                                {/* Fecha de finalización */}
                                <div className="min-w-32">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#765C78]">
                                        Fecha de finalización
                                    </p>

                                    <p className="text-sm text-gray-700">
                                        {formatDate(cover.end_at)}
                                    </p>
                                </div>

                                {/* Editar */}
                                <div className="flex shrink-0 items-center">
                                    <Link
                                        href={`/admin/covers/${cover.id}/edit`}
                                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[#59465B] transition-colors"
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
                                            className="h-4 w-4"
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
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>

            {covers.length > 0 && (
                <p className="mt-4 text-xs text-gray-500">
                    Podés arrastrar las portadas para cambiar su orden.
                </p>
            )}
        </AdminLayout>
    );
}
