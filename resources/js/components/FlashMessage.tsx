
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface FlashProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function FlashMessage() {
    const { flash } = usePage().props as FlashProps;

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [flash]);

    if (!visible || (!flash?.success && !flash?.error)) {
        return null;
    }

    const isSuccess = !!flash.success;
    const message = flash.success || flash.error;

    return (
        <div
            className={`flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${
                isSuccess
                    ? 'border-[#D8C2D8] bg-[#F8F3F8] text-[#765C78]'
                    : 'border-[#F2BFBD] bg-[#FFF5F4] text-[#754B4A]'
            }`}
        >
            <div className="flex items-center gap-3">
                {isSuccess ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#8C5770]" />
                ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-[#C77D79]" />
                )}

                <div>
                    <p className="font-semibold">
                        {isSuccess
                            ? '¡Operación exitosa!'
                            : 'Hubo un problema'}
                    </p>

                    <p className="text-sm">{message}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setVisible(false)}
                className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Cerrar notificación"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
