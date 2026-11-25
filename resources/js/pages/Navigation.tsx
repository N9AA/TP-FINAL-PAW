
import { useEffect, useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';

import {
    Menu,
    X,
    User,
    ShoppingCart,
    ChevronRight,
    ChevronLeft,
    LogOut,
    LayoutDashboard,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';

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

interface AuthUser {
    id: number;
    name: string;
    email: string;
    profile_photo_url: string | null;
}

interface SharedProps extends Record<string, unknown> {
    auth: {
        user: AuthUser | null;
    };
    cartCount?: number;
}

interface NavigationProps {
    families: Family[];
}

export default function Navigation({ families }: NavigationProps) {
    const { auth, cartCount: initialCartCount = 0 } =
        usePage<SharedProps>().props;

    const { can } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const [search, setSearch] = useState(() =>
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('search') ?? ''
            : ''
    );

    const [mobileView, setMobileView] = useState<
        'families' | 'categories'
    >('families');

    const [familyId, setFamilyId] = useState<number | null>(
        families.length > 0 ? families[0].id : null
    );

    const [cartCount, setCartCount] = useState(initialCartCount);

    const selectedFamily =
        families.find((family) => family.id === familyId) ?? families[0];

    const categories = selectedFamily?.categories ?? [];
    const user = auth.user;

    // ACTUALIZACIÓN DEL CONTADOR DEL CARRITO
    useEffect(() => {
        const handleCartUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<number>;
            setCartCount(customEvent.detail);
        };

        window.addEventListener('cartUpdated', handleCartUpdated);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdated);
        };
    }, []);

    useEffect(() => {
        setCartCount(initialCartCount);
    }, [initialCartCount]);

    const openMenu = () => {
        setMobileView('families');
        setIsMenuOpen(true);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setMobileView('families');
    };

    const selectFamily = (id: number) => {
        setFamilyId(id);
        setMobileView('categories');
    };

    const logout = () => {
        router.post('/logout');
        setIsUserMenuOpen(false);
    };

    // BÚSQUEDA GLOBAL
    const handleSearch = (value: string) => {
        setSearch(value);

        const currentPath = window.location.pathname;

        const currentParams = Object.fromEntries(
            new URLSearchParams(window.location.search).entries()
        );

        // En el Home busca en todos los productos.
        // En las demás páginas conserva la búsqueda contextual.
        const searchPath = currentPath === '/' ? '/' : currentPath;

        router.get(
            searchPath,
            {
                ...currentParams,
                search: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const searchClass =
        'w-full rounded-lg border border-[#E8DDE6] bg-white px-4 py-2 text-gray-800 placeholder:text-gray-400 shadow-sm outline-none focus:border-[#9D6C83] focus:ring-2 focus:ring-[#E8D1DD]';

    return (
        <>
            {/* ENCABEZADO */}
            <header className="bg-[#9D6C83]">
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center justify-between gap-4">

                        {/* BOTÓN MENÚ */}
                        <button
                            type="button"
                            onClick={openMenu}
                            className="text-white"
                            aria-label="Abrir menú"
                        >
                            <Menu size={28} />
                        </button>

                        {/* LOGO */}
                        <Link
                            href="/"
                            className="inline-flex flex-col items-end text-white"
                        >
                            <span className="text-xl font-semibold leading-6 md:text-3xl">
                                Meraki
                            </span>

                            <span className="text-xs">
                                Tienda Online
                            </span>
                        </Link>

                        {/* BUSCADOR DESKTOP */}
                        <div className="hidden flex-1 md:block">
                            <input
                                type="search"
                                value={search}
                                onChange={(e) =>
                                    handleSearch(e.target.value)
                                }
                                placeholder="Buscar por producto, tienda o marca"
                                className={searchClass}
                            />
                        </div>

                        {/* USUARIO Y CARRITO */}
                        <div className="flex items-center gap-4 md:gap-8">

                            {/* MENÚ USUARIO */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsUserMenuOpen(!isUserMenuOpen)
                                    }
                                    className="flex items-center text-white"
                                    aria-label="Menú de usuario"
                                    aria-expanded={isUserMenuOpen}
                                >
                                    {user?.profile_photo_url ? (
                                        <img
                                            src={user.profile_photo_url}
                                            alt="Foto de perfil"
                                            className="h-9 w-9 rounded-full border-2 border-white object-cover"
                                        />
                                    ) : (
                                        <User size={26} />
                                    )}
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <button
                                            type="button"
                                            className="fixed inset-0 z-20 cursor-default"
                                            onClick={() =>
                                                setIsUserMenuOpen(false)
                                            }
                                            aria-label="Cerrar menú de usuario"
                                        />

                                        <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-lg border border-[#E8DDE6] bg-white py-2 shadow-lg">
                                            {!user ? (
                                                <div className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <Link
                                                            href="/login"
                                                            className="rounded-lg bg-[#9D6C83] px-4 py-2 text-white transition-colors hover:bg-[#85576D]"
                                                        >
                                                            Iniciar sesión
                                                        </Link>
                                                    </div>

                                                    <p className="mt-3 text-center text-sm text-gray-600">
                                                        ¿No tienes cuenta?{' '}
                                                        <Link
                                                            href="/register"
                                                            className="text-[#9D6C83] hover:underline"
                                                        >
                                                            Regístrate
                                                        </Link>
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="border-b border-[#E8DDE6] px-4 py-3">
                                                        <p className="font-semibold text-gray-800">
                                                            {user.name}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            {user.email}
                                                        </p>
                                                    </div>

                                                    {/* PANEL DE ADMINISTRACIÓN */}
                                                    {can('access dashboard') && (
                                                        <Link
                                                            href="/admin"
                                                            className="flex items-center gap-2 border-b border-[#E8DDE6] px-4 py-3 font-medium text-[#9D6C83] hover:bg-[#FAF7F9]"
                                                            onClick={() =>
                                                                setIsUserMenuOpen(false)
                                                            }
                                                        >
                                                            <LayoutDashboard size={18} />
                                                            Panel de administración
                                                        </Link>
                                                    )}

                                                    {/* MI PERFIL */}
                                                    <Link
                                                        href="/perfil"
                                                        className="block px-4 py-3 text-gray-700 hover:bg-[#FAF7F9]"
                                                        onClick={() =>
                                                            setIsUserMenuOpen(false)
                                                        }
                                                    >
                                                        Mi perfil
                                                    </Link>

                                                    {/* CERRAR SESIÓN */}
                                                    <div className="border-t border-[#E8DDE6]">
                                                        <button
                                                            type="button"
                                                            onClick={logout}
                                                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-gray-700 hover:bg-[#FAF7F9]"
                                                        >
                                                            <LogOut size={18} />
                                                            Cerrar sesión
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* CARRITO */}
                            <Link
                                href="/cart"
                                className="relative text-white"
                                aria-label="Carrito de compras"
                            >
                                <ShoppingCart size={26} />

                                <span
                                    id="cart-count"
                                    className="absolute -top-2 -end-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                                >
                                    {cartCount}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* BUSCADOR MOBILE */}
                    <div className="mt-4 md:hidden">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                            placeholder="Buscar por producto, tienda o marca"
                            className={searchClass}
                        />
                    </div>
                </div>
            </header>

            {/* MENÚ LATERAL */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40">

                    {/* FONDO OSCURO */}
                    <button
                        type="button"
                        onClick={closeMenu}
                        className="absolute inset-0 h-full w-full bg-black/25"
                        aria-label="Cerrar menú"
                    />

                    {/* CONTENIDO DEL MENÚ */}
                    <div className="absolute left-0 top-0 flex h-full w-full flex-col overflow-hidden bg-white md:flex-row">

                        {/* PANEL DE FAMILIAS */}
                        <div
                            className={`flex h-full w-full flex-col bg-white md:w-80 md:flex-none ${
                                mobileView === 'categories'
                                    ? 'hidden md:flex'
                                    : 'flex'
                            }`}
                        >
                            {/* CABECERA */}
                            <div className="flex shrink-0 items-center justify-between bg-[#9D6C83] px-4 py-3 font-semibold text-white">
                                <span className="text-lg">
                                    ¡Hola!
                                </span>

                                <button
                                    type="button"
                                    onClick={closeMenu}
                                    aria-label="Cerrar menú"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* LISTA DE FAMILIAS */}
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                <ul>
                                    {families.map((family) => (
                                        <li key={family.id}>
                                            <div
                                                onMouseEnter={() =>
                                                    setFamilyId(family.id)
                                                }
                                                className={`flex items-center justify-between px-4 py-4 text-gray-700 hover:bg-[#FAF7F9] ${
                                                    familyId === family.id
                                                        ? 'bg-[#F2E8ED]'
                                                        : ''
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        selectFamily(family.id)
                                                    }
                                                    className="flex-1 text-left"
                                                >
                                                    {family.name}
                                                </button>

                                                <Link
                                                    href={`/families/${family.id}`}
                                                    onClick={closeMenu}
                                                    className="ml-2 text-[#9D6C83]"
                                                    aria-label={`Ver familia ${family.name}`}
                                                >
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* PANEL DE CATEGORÍAS Y SUBCATEGORÍAS */}
                        <div
                            className={`min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6 md:px-8 md:py-8 md:pt-[52px] ${
                                mobileView === 'families'
                                    ? 'hidden md:block'
                                    : 'block'
                            }`}
                        >
                            {/* VOLVER - SOLO CELULAR */}
                            <button
                                type="button"
                                onClick={() => setMobileView('families')}
                                className="mb-6 flex items-center gap-2 text-sm font-medium text-[#9D6C83] hover:text-[#85576D] md:hidden"
                            >
                                <ChevronLeft size={20} />
                                Volver a las familias
                            </button>

                            {selectedFamily && (
                                <>
                                    {/* TÍTULO DE FAMILIA */}
                                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                        <p className="border-b-[3px] border-[#9D6C83] pb-1 text-xl font-semibold uppercase text-gray-800">
                                            {selectedFamily.name}
                                        </p>

                                        <Link
                                            href={`/families/${selectedFamily.id}`}
                                            onClick={closeMenu}
                                            className="rounded-lg bg-[#9D6C83] px-4 py-2 text-white transition-colors hover:bg-[#85576D]"
                                        >
                                            Ver todo
                                        </Link>
                                    </div>

                                    {/* CATEGORÍAS */}
                                    <ul className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                                        {categories.map((category) => (
                                            <li key={category.id}>
                                                <Link
                                                    href={`/categories/${category.id}`}
                                                    onClick={closeMenu}
                                                    className="text-lg font-semibold text-[#9D6C83] hover:text-[#85576D]"
                                                >
                                                    {category.name}
                                                </Link>

                                                {/* SUBCATEGORÍAS */}
                                                <ul className="mt-4 space-y-2">
                                                    {category.subcategories.map(
                                                        (subcategory) => (
                                                            <li key={subcategory.id}>
                                                                <Link
                                                                    href={`/subcategories/${subcategory.id}`}
                                                                    onClick={closeMenu}
                                                                    className="text-sm text-gray-700 hover:text-[#9D6C83]"
                                                                >
                                                                    {subcategory.name}
                                                                </Link>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
