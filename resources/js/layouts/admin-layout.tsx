
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

import Navigation from './partials/admin/navigation';
import Sidebar from './partials/admin/sidebar';
import Breadcrumb from './partials/admin/breadcrumb';

interface Props {
    children: ReactNode;
    breadcrumbs?: {
        name: string;
        route?: string;
    }[];
    action?: ReactNode;
}

interface FlashMessage {
    icon: 'success' | 'error' | 'warning' | 'info' | 'question';
    title: string;
    text: string;
}

interface PageProps {
    flash: {
        swal?: FlashMessage;
    };
    [key: string]: unknown;
}

export default function AdminLayout({
    children,
    breadcrumbs = [],
    action,
}: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash.swal) {
            Swal.fire(flash.swal);
        }
    }, [flash]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 639px)');

        const updateScroll = () => {
            document.body.style.overflow =
                mediaQuery.matches && isSidebarOpen ? 'hidden' : '';
        };

        updateScroll();

        mediaQuery.addEventListener('change', updateScroll);

        return () => {
            mediaQuery.removeEventListener('change', updateScroll);
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Navigation
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isUserMenuOpen={isUserMenuOpen}
                setIsUserMenuOpen={setIsUserMenuOpen}
            />

            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-gray-900/50 sm:hidden"
                />
            )}

            <Sidebar isSidebarOpen={isSidebarOpen} />

            <main className="p-4 sm:ml-64">
                <div className="mt-14">
                    <div className="flex justify-between items-center">
                        <Breadcrumb breadcrumbs={breadcrumbs} />

                        {action && <div>{action}</div>}
                    </div>

                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg dark:border-gray-700">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
