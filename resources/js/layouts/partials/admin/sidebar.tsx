
import { Link, usePage } from '@inertiajs/react';
import {
    Gauge,
    PackageOpen,
    Tags,
    Tag,
    ShoppingBag,
    Settings,
    Images,
    ShoppingCart,
    Truck,
    PackageCheck,
    Shield,
    KeyRound,
    Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Props {
    isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: Props) {
    const { url } = usePage();
    const { can } = useAuth();

    const links = [
        {
            header: 'Administrar página',
        },
        {
            name: 'Dashboard',
            icon: Gauge,
            route: '/admin',
            active: url === '/admin',
            permission: 'access dashboard',
        },
        {
            name: 'Opciones',
            icon: Settings,
            route: '/admin/options',
            active: url.startsWith('/admin/options'),
            permission: 'manage options',
        },
        {
            name: 'Familias',
            icon: PackageOpen,
            route: '/admin/families',
            active: url.startsWith('/admin/families'),
            permission: 'manage families',
        },
        {
            name: 'Categorías',
            icon: Tags,
            route: '/admin/categories',
            active: url.startsWith('/admin/categories'),
            permission: 'manage categories',
        },
        {
            name: 'Subcategorías',
            icon: Tag,
            route: '/admin/subcategories',
            active: url.startsWith('/admin/subcategories'),
            permission: 'manage subcategories',
        },
        {
            name: 'Productos',
            icon: ShoppingBag,
            route: '/admin/products',
            active: url.startsWith('/admin/products'),
            permission: 'manage products',
        },
        {
            name: 'Portadas',
            icon: Images,
            route: '/admin/covers',
            active: url.startsWith('/admin/covers'),
            permission: 'manage covers',
        },
        {
            header: 'Órdenes y envíos',
        },
        {
            name: 'Órdenes',
            icon: ShoppingCart,
            route: '/admin/orders',
            active: url.startsWith('/admin/orders'),
            permission: 'manage orders',
        },
        {
            name: 'Conductores',
            icon: Truck,
            route: '/admin/drivers',
            active: url.startsWith('/admin/drivers'),
            permission: 'manage drivers',
        },
        {
            name: 'Envíos',
            icon: PackageCheck,
            route: '/admin/shipments',
            active: url.startsWith('/admin/shipments'),
            permission: 'manage shipments',
        },
        {
            header: 'Administración de usuarios',
        },
        {
            name: 'Roles',
            icon: Shield,
            route: '/admin/roles',
            active: url.startsWith('/admin/roles'),
            permission: 'manage roles',
        },
        {
            name: 'Permisos',
            icon: KeyRound,
            route: '/admin/permissions',
            active: url.startsWith('/admin/permissions'),
            permission: 'manage permissions',
        },
        {
            name: 'Usuarios',
            icon: Users,
            route: '/admin/users',
            active: url.startsWith('/admin/users'),
            permission: 'manage users',
        },
    ];

    const visibleLinks = links.filter((link) => {
        if ('header' in link) {
            return true;
        }

        return can(link.permission);
    });

    return (
        <aside
            id="top-bar-sidebar"
            className={`fixed top-0 left-0 z-40 h-full w-64 border-e border-[#E8DDE6] bg-white pt-14 transition-transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } sm:translate-x-0`}
            aria-label="Menú lateral"
        >
            <div className="h-full overflow-y-auto px-3 py-4">
                <ul className="space-y-2 font-medium">
                    {visibleLinks.map((link, index) => {
                        if ('header' in link) {
                            return (
                                <li
                                    key={link.header}
                                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#A18B99] ${
                                        index !== 0 ? 'pt-5' : ''
                                    }`}
                                >
                                    {link.header}
                                </li>
                            );
                        }

                        const Icon = link.icon;

                        return (
                            <li key={link.name}>
                                <Link
                                    href={link.route}
                                    className={`group flex items-center rounded-lg px-3 py-2 transition-colors duration-200 ${
                                        link.active
                                            ? 'bg-[#F5ECF2] font-semibold text-[#8C5770]'
                                            : 'text-gray-700 hover:bg-[#FAF4F8] hover:text-[#8C5770]'
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                                            link.active
                                                ? 'text-[#8C5770]'
                                                : 'text-gray-400 group-hover:text-[#8C5770]'
                                        }`}
                                    />

                                    <span className="ms-3">
                                        {link.name}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
