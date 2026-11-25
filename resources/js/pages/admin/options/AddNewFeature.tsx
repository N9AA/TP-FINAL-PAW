
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Input } from '@/components/ui/input';

interface Option {
    id: number;
    type: number;
}

interface Props {
    option: Option;
}

interface FeatureForm {
    value: string;
    description: string;
}

export default function AddNewFeature({ option }: Props) {
    const { data, setData, post, processing, errors, reset } =
        useForm<FeatureForm>({
            value: '',
            description: '',
        });

    const addFeature = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(`/admin/options/${option.id}/features`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <form
            onSubmit={addFeature}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
            {/* Valor */}
            <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Valor
                </label>

                {option.type === 1 ? (
                    <Input
                        value={data.value}
                        onChange={(e) =>
                            setData('value', e.target.value)
                        }
                        placeholder="Ingrese el valor"
                    />
                ) : (
                    <div className="flex h-10 items-center justify-between rounded-md border border-gray-300 px-3">
                        <span className="text-sm text-gray-600">
                            {data.value || 'Seleccione un color'}
                        </span>

                        <input
                            type="color"
                            value={data.value || '#000000'}
                            onChange={(e) =>
                                setData('value', e.target.value)
                            }
                            className="h-7 w-10 cursor-pointer"
                        />
                    </div>
                )}

                {errors.value && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.value}
                    </p>
                )}
            </div>

            {/* Descripción */}
            <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Descripción
                </label>

                <Input
                    value={data.description}
                    onChange={(e) =>
                        setData('description', e.target.value)
                    }
                    placeholder="Ingrese una descripción"
                />

                {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Botón */}
            <div>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex h-9 items-center justify-center rounded-md border-0 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#75465C] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                        backgroundColor: '#8C5770',
                    }}
                >
                    {processing ? 'Agregando...' : 'Agregar'}
                </button>
            </div>
        </form>
    );
}

