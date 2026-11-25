
import { Head, usePage } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';

type Props = {
    isAdmin?: boolean;
};

export default function Appearance() {
    const { isAdmin = false } = usePage<Props>().props;

    const appearanceUrl = isAdmin
        ? '/admin/settings/appearance'
        : '/settings/appearance';

    return (
        <>
            <Head title="Configuración de apariencia" />

            <h1 className="sr-only">Configuración de apariencia</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Configuración de apariencia"
                    description="Actualizá la apariencia de tu cuenta"
                />

                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Configuración de apariencia',
            href: '/settings/appearance',
        },
    ],
};
