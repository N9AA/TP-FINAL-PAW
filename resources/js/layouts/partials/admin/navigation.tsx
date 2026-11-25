import { Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { logout } from '@/routes';
import { useAuth } from '@/hooks/use-auth';

interface Props {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (value: boolean) => void;
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (value: boolean) => void;
}

export default function Navigation({
    isSidebarOpen,
    setIsSidebarOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const { can } = useAuth();

    if (!user) {
        return null;
    }

    const userPhoto =
        user.profile_photo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-[#E8DDE6] bg-white">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between gap-4">

                    {/* LOGO Y MENÚ */}
                    <div className="flex shrink-0 items-center justify-start rtl:justify-end">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="rounded-lg border border-transparent bg-transparent p-2 text-sm font-medium leading-5 text-gray-700 hover:bg-[#FAF4F8] hover:text-[#8C5770] focus:outline-none focus:ring-4 focus:ring-[#F5ECF2] sm:hidden"
                        >
                            <span className="sr-only">Abrir menú lateral</span>
                            <svg
                                className="h-6 w-6"
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
                                    strokeWidth="2"
                                    d="M5 7h14M5 12h14M5 17h10"
                                />
                            </svg>
                        </button>

                        <Link
                            href="/"
                            className="ms-2 flex items-center md:me-8 lg:me-12"
                        >
                            <span className="text-2xl font-bold tracking-wide text-[#8C5770]">
                                Meraki
                            </span>

                            <span className="ml-2 text-sm text-gray-500">
                                Tienda Online
                            </span>
                        </Link>
                    </div>

                    {/* ACCIONES DE LA DERECHA */}
                    <div className="flex shrink-0 items-center gap-5 lg:gap-7">

                        {/* IR A LA TIENDA */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#8C5770] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#75465C]"
                        >
                            <svg
                                className="h-5 w-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 9l1-5h16l1 5M5 9v11h14V9M9 20v-6h6v6M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"
                                />
                            </svg>

                            <span className="hidden sm:inline">
                                Ir a la tienda
                            </span>
                        </Link>

                        {/* MENÚ DE USUARIO */}
                        <div className="relative flex items-center border-l border-[#E8DDE6] pl-5 lg:pl-7">
                            <button
                                type="button"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex rounded-full bg-gray-100 text-sm transition hover:ring-2 hover:ring-[#D5C5D9] focus:outline-none focus:ring-4 focus:ring-[#F5ECF2]"
                                aria-expanded={isUserMenuOpen}
                            >
                                <span className="sr-only">
                                    Abrir menú de usuario
                                </span>

                                <img
                                    className="h-9 w-9 rounded-full object-cover"
                                    src={userPhoto}
                                    alt="Foto de perfil"
                                />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-12 z-50 my-4 w-56 list-none rounded-lg border border-[#E8DDE6] bg-white text-base shadow-lg">

                                    {/* INFORMACIÓN DEL USUARIO */}
                                    <div
                                        className="border-b border-[#E8DDE6] px-4 py-3"
                                        role="none"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={userPhoto}
                                                alt="Foto de perfil"
                                                className="h-10 w-10 rounded-full object-cover"
                                            />

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </p>

                                                <p className="truncate text-sm text-gray-500">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* OPCIONES DEL MENÚ */}
                                    <ul className="p-2 text-sm font-medium text-gray-700">
                                        {can('access dashboard') && (
                                            <li>
                                                <Link
                                                    href="/"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="inline-flex w-full items-center rounded p-2 hover:bg-[#FAF4F8] hover:text-[#8C5770]"
                                                >
                                                    <svg
                                                        className="mr-2 h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 9l1-5h16l1 5M5 9v11h14V9M9 20v-6h6v6"
                                                        />
                                                    </svg>

                                                    Ir a la tienda
                                                </Link>
                                            </li>
                                        )}

                                        <li>
                                            <Link
                                                href="/admin/perfil"
                                                prefetch
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="inline-flex w-full items-center rounded p-2 hover:bg-[#FAF4F8] hover:text-[#8C5770]"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6a10 10 0 100 20 10 10 0 000-20z"
                                                    />
                                                </svg>

                                                Configuración
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                href={logout()}
                                                method="post"
                                                as="button"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="inline-flex w-full items-center rounded p-2 text-left hover:bg-[#FAF4F8] hover:text-[#8C5770]"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>

                                                Cerrar sesión
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
