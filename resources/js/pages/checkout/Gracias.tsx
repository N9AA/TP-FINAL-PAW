import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StoreLayout from '@/layouts/store-layout';

interface Props {
    paymentId: string | null;
    orderId: number | string | null;
    paymentStatus: string | null;
}

export default function Gracias({
    paymentId,
    orderId,
    paymentStatus,
}: Props) {
    const [confirmed, setConfirmed] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setChecking(false);
            setError('No se recibió el número de orden.');
            return;
        }

        let active = true;
        let timeout: ReturnType<typeof setTimeout>;

        const confirmOrder = async () => {
            try {
                const csrfToken = document
                    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                    ?.content;

                const response = await fetch(
                    `/checkout/ordenes/${orderId}/confirmar`,
                    {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            ...(csrfToken
                                ? { 'X-CSRF-TOKEN': csrfToken }
                                : {}),
                        },
                    },
                );

                const data = await response.json();

                if (!active) return;

                if (response.ok && data.confirmed === true) {
                    setConfirmed(true);
                    setChecking(false);
                    setError(null);

                    router.reload({
                        only: ['cartCount'],
                    });

                    return;
                }

                if (response.status === 202) {
                    timeout = setTimeout(confirmOrder, 3000);
                    return;
                }

                if (response.status === 409) {
                    setChecking(false);
                    setError(
                        data.message || 'No se pudo completar la compra.',
                    );
                    return;
                }

                setChecking(false);
                setError(
                    data.message || 'No se pudo confirmar la compra.',
                );
            } catch {
                if (!active) return;

                timeout = setTimeout(confirmOrder, 3000);
            }
        };

        confirmOrder();

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [orderId]);

    return (
        <StoreLayout>
            <Head title="Resultado de tu compra" />

            <div className="min-h-screen bg-[#FAF7F9] px-4 py-12">
                <div className="mx-auto max-w-3xl">
                    <div className="overflow-hidden rounded-lg border border-[#E8DDE6] bg-white shadow-sm">

                        {/* Encabezado */}
                        <div className="bg-[#9D6C83] px-6 py-5 text-center">
                            <h1 className="text-2xl font-bold text-white">
                                Resultado de tu compra
                            </h1>
                        </div>

                        <div className="p-8 text-center">

                            {/* Compra confirmada */}
                            {confirmed ? (
                                <>
                                    <div className="mb-4 text-5xl">✅</div>

                                    <h2 className="text-xl font-bold text-gray-800">
                                        ¡Gracias por tu compra!
                                    </h2>

                                    <p className="mt-3 text-gray-600">
                                        Tu pago fue aprobado y tu compra
                                        quedó confirmada correctamente.
                                    </p>
                                </>
                            ) : checking ? (
                                <>
                                    <div className="mb-4 text-5xl">⏳</div>

                                    <h2 className="text-xl font-bold text-gray-800">
                                        Estamos confirmando tu compra
                                    </h2>

                                    <p className="mt-3 text-gray-600">
                                        Estamos esperando la confirmación
                                        de Mercado Pago. Esta operación
                                        puede demorar unos instantes.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 text-5xl">ℹ️</div>

                                    <h2 className="text-xl font-semibold text-gray-800">
                                        No pudimos confirmar tu compra
                                    </h2>

                                    <p className="mt-3 text-gray-600">
                                        {error ||
                                            'No se recibió la confirmación de la operación.'}
                                    </p>
                                </>
                            )}

                            {/* Información de la operación */}
                            <div className="mt-8 rounded-lg border border-[#E8DDE6] bg-[#FAF7F9] p-5 text-left">
                                <h3 className="mb-4 font-semibold text-gray-800">
                                    Información de la operación
                                </h3>

                                <div className="space-y-3 text-sm">

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Número de orden
                                        </span>

                                        <span className="font-medium text-gray-800">
                                            {orderId ?? 'No disponible'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Número de operación
                                        </span>

                                        <span className="font-medium text-gray-800">
                                            {paymentId || 'Pendiente'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-[#E8DDE6] pt-3">
                                        <span className="font-semibold text-gray-800">
                                            Estado
                                        </span>

                                        <span className="font-bold text-[#9D6C83]">
                                            {confirmed
                                                ? 'Compra confirmada'
                                                : checking
                                                  ? 'En verificación'
                                                  : paymentStatus === 'approved'
                                                    ? 'Pago aprobado, orden pendiente de confirmación'
                                                    : 'Sin confirmar'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link
                                    href="/"
                                    className="rounded-lg bg-[#9D6C83] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#85576D]"
                                >
                                    Volver a la tienda
                                </Link>

                                {!confirmed && (
                                    <Link
                                        href="/cart"
                                        className="rounded-lg border border-[#E8DDE6] px-6 py-3 text-sm font-semibold text-[#9D6C83] transition-colors duration-200 hover:bg-[#FAF7F9]"
                                    >
                                        Volver al carrito
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}