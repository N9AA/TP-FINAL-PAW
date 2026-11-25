import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}

export default function AdminLayout({ breadcrumbs = [], children }: Props) {
    // Si tu starter kit pasa el usuario autenticado en auth.user:
    const { auth } = usePage<{ auth?: { user?: { name: string; email: string; avatar?: string } } }>().props;
    const user = auth?.user;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            {/* Botón hamburguesa móvil */}
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="sm:hidden text-gray-500 bg-transparent hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10" />
                                </svg>
                            </button>

                            {/* Logo */}
                            <Link href="/admin" className="flex ms-2 md:me-24">
                                <img src="https://flowbite.com/docs/images/logo.svg" className="h-6 me-3" alt="Logo" />
                                <span className="self-center text-lg font-semibold whitespace-nowrap dark:text-white">
                                    Mi Ecommerce
                                </span>
                            </Link>
                        </div>

                        {/* Menú de Usuario */}
                        <div className="flex items-center">
                            <div className="relative flex items-center ms-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                        aria-expanded={isUserMenuOpen}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <img
                                            className="w-8 h-8 rounded-full object-cover"
                                            src={user?.avatar || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                                            alt="Foto de perfil"
                                        />
                                    </button>
                                </div>

                                {/* Dropdown usuario */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-10 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600 w-44">
                                        <div className="px-4 py-3" role="none">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white" role="none">
                                                {user?.name || 'Neil Sims'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-300" role="none">
                                                {user?.email || 'neil.sims@flowbite.com'}
                                            </p>
                                        </div>
                                        <ul className="py-1" role="none">
                                            <li>
                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                                >
                                                    Settings
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    method="post"
                                                    as="button"
                                                    href="/logout"
                                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                                >
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

            {/* Backdrop para cerrar el sidebar en móviles al hacer clic afuera */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-gray-900/50 sm:hidden"
                />
            )}

            {/* Sidebar lateral */}
            <aside
                id="top-bar-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-full pt-20 transition-transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 pb-4 overflow-y-auto">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link
                                href="/admin"
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z" />
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z" />
                                </svg>
                                <span className="ms-3">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/products"
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v4m3-2 .917 11.923A1 1 0 0 1 17.92 21H6.08a1 1 0 0 1-.997-1.077L6 8h12Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Productos</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/orders"
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h3.439a.991.991 0 0 1 .908.6 3.978 3.978 0 0 0 7.306 0 .99.99 0 0 1 .908-.6H20M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M4 13l2-9h12l2 9M9 7h6m-7 3h8" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Pedidos</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Contenido principal (Donde se renderizan las páginas de tu curso) */}
            <main className="p-4 sm:ml-64 pt-20">
                {breadcrumbs.length > 0 && (
                    <nav className="mb-4 flex text-sm text-gray-600 dark:text-gray-400">
                        {breadcrumbs.map((item, idx) => (
                            <span key={idx} className="flex items-center">
                                {idx > 0 && <span className="mx-2">/</span>}
                                {item.href ? (
                                    <Link href={item.href} className="hover:underline">
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {item.title}
                                    </span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                {children}
            </main>
        </div>
    );
}

