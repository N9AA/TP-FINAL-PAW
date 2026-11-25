
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Navigation from '@/pages/Navigation';
import Footer from '@/layouts/partials/app/footer';
import { usePage } from '@inertiajs/react';
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

interface SharedProps {
    families: Family[];
    flash: {
        swal?: {
            id?: string;
            icon: 'success' | 'error' | 'warning' | 'info' | 'question';
            title: string;
            text: string;
        } | null;
    };
    [key: string]: unknown;
}

interface StoreLayoutProps {
    children: ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
    const { families, flash } = usePage<SharedProps>().props;

    useEffect(() => {
        if (flash.swal) {
            Swal.fire(flash.swal);
        }
    }, [flash.swal]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navigation families={families} />

            <main className="flex-1">
                {children}
            </main>

            <div className="mt-16">
                <Footer />
            </div>
        </div>
    );
}
