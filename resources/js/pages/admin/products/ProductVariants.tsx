
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';

interface Feature {
    id: number;
    value: string;
    description: string;
    option_id: number;
}

interface Option {
    id: number;
    name: string;
    type: number;
    features: Feature[];
}

interface ProductOption extends Option {
    pivot: {
        features: unknown;
    };
}

interface Variant {
    id: number;
    sku: string;
    stock: number;
    image: string;
    features: Feature[];
}

interface Product {
    id: number;
    name: string;
    options: ProductOption[];
    variants: Variant[];
}

interface Props {
    product: Product;
    options: Option[];
}

export default function ProductVariants({ product, options }: Props) {
    const [openModal, setOpenModal] = useState(false);
    const [selectedOptionId, setSelectedOptionId] = useState('');
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);
    const [newFeatureIds, setNewFeatureIds] = useState<Record<number, string>>({});
    const [processing, setProcessing] = useState(false);

    // Convierte pivot.features en un array de identificadores.
    const getSelectedFeatureIds = (option: ProductOption): number[] => {
        let features = option.pivot?.features;

        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
            } catch {
                return [];
            }
        }

        if (!Array.isArray(features)) {
            return [];
        }

        return features
            .map((feature) => {
                if (typeof feature === 'number' || typeof feature === 'string') {
                    return Number(feature);
                }

                if (
                    typeof feature === 'object' &&
                    feature !== null &&
                    'id' in feature
                ) {
                    return Number(feature.id);
                }

                return NaN;
            })
            .filter((id) => Number.isInteger(id) && id > 0);
    };

    // Obtiene los objetos Feature correspondientes a los IDs guardados.
    const getSelectedFeatures = (option: ProductOption): Feature[] => {
        const selectedIds = getSelectedFeatureIds(option);

        return (option.features ?? []).filter((feature) =>
            selectedIds.includes(feature.id)
        );
    };

    const availableOptions = options.filter(
        (option) => !product.options.some((item) => item.id === option.id)
    );

    const selectedOption = options.find(
        (option) => option.id === Number(selectedOptionId)
    );

    const toggleFeature = (featureId: number) => {
        setSelectedFeatureIds((current) =>
            current.includes(featureId)
                ? current.filter((id) => id !== featureId)
                : [...current, featureId]
        );
    };

    const closeModal = () => {
        setOpenModal(false);
        setSelectedOptionId('');
        setSelectedFeatureIds([]);
    };

    const saveOption = () => {
        if (!selectedOptionId) {
            Swal.fire('Atención', 'Seleccione una opción.', 'warning');
            return;
        }

        if (selectedFeatureIds.length === 0) {
            Swal.fire('Atención', 'Seleccione al menos un valor.', 'warning');
            return;
        }

        setProcessing(true);

        router.post(
            `/admin/products/${product.id}/options`,
            {
                option_id: Number(selectedOptionId),
                feature_ids: selectedFeatureIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const addFeature = (option: ProductOption) => {
        const featureId = Number(newFeatureIds[option.id]);

        if (!featureId) {
            Swal.fire('Atención', 'Seleccione un valor.', 'warning');
            return;
        }

        const currentIds = getSelectedFeatureIds(option);

        if (currentIds.includes(featureId)) {
            Swal.fire('Atención', 'Este valor ya está agregado.', 'warning');
            return;
        }

        const featureIds = [...currentIds, featureId];

        setProcessing(true);

        router.put(
            `/admin/products/${product.id}/options/${option.id}/features`,
            { feature_ids: featureIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewFeatureIds((current) => ({
                        ...current,
                        [option.id]: '',
                    }));
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const deleteOption = (optionId: number) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Se eliminará esta opción del producto y se actualizarán sus variantes.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    `/admin/products/${product.id}/options/${optionId}`,
                    { preserveScroll: true }
                );
            }
        });
    };

    const deleteFeature = (optionId: number, featureId: number) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Se eliminará este valor y se actualizarán las variantes.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    `/admin/products/${product.id}/options/${optionId}/features/${featureId}`,
                    { preserveScroll: true }
                );
            }
        });
    };

    const getAvailableFeatures = (option: ProductOption) => {
        const usedIds = getSelectedFeatureIds(option);

        return (option.features ?? []).filter(
            (feature) => !usedIds.includes(feature.id)
        );
    };

    return (
        <>
            {/* Sección de opciones */}
            <section className="rounded-lg border border-[#E8DDE6] bg-white shadow-sm">
                <header className="border-b border-[#E8DDE6] px-6 py-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Opciones
                        </h2>

                        <Button
                            type="button"
                            onClick={() => setOpenModal(true)}
                            disabled={availableOptions.length === 0 || processing}
                            className="bg-[#8C5770] text-white shadow-sm hover:bg-[#75465C]"
                        >
                            <Plus size={16} className="mr-2" />
                            Nuevo
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {product.options.length > 0 ? (
                        <div className="space-y-6">
                            {product.options.map((option) => {
                                const selectedFeatures = getSelectedFeatures(option);

                                return (
                                    <div
                                        key={option.id}
                                        className="relative rounded-lg border border-[#E8DDE6] p-6"
                                    >
                                        <div className="absolute -top-3 left-4 flex items-center bg-white px-2">
                                            <button
                                                type="button"
                                                onClick={() => deleteOption(option.id)}
                                                className="mr-2 text-red-500 hover:text-red-600"
                                                aria-label={`Eliminar opción ${option.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <span className="font-medium text-gray-700">
                                                {option.name}
                                            </span>
                                        </div>

                                        {/* Valores asociados */}
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFeatures.map((feature) => (
                                                <div key={feature.id}>
                                                    {option.type === 1 ? (
                                                        <span className="inline-flex items-center rounded border border-[#E8DDE6] bg-[#FAF7F9] px-2.5 py-1 text-xs text-[#5F4665]">
                                                            {feature.description}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteFeature(
                                                                        option.id,
                                                                        feature.id
                                                                    )
                                                                }
                                                                className="ml-2 text-gray-500 hover:text-red-500"
                                                                aria-label="Eliminar valor"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </span>
                                                    ) : option.type === 2 ? (
                                                        <span className="relative inline-flex items-center">
                                                            <span
                                                                className="h-7 w-7 rounded-full border-2 border-gray-300 shadow"
                                                                style={{
                                                                    backgroundColor: feature.value,
                                                                }}
                                                                title={feature.description}
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteFeature(
                                                                        option.id,
                                                                        feature.id
                                                                    )
                                                                }
                                                                className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                                                                aria-label="Eliminar color"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded border border-[#E8DDE6] bg-[#FAF7F9] px-2.5 py-1 text-xs text-[#5F4665]">
                                                            {feature.description}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteFeature(
                                                                        option.id,
                                                                        feature.id
                                                                    )
                                                                }
                                                                className="ml-2 text-gray-500 hover:text-red-500"
                                                                aria-label="Eliminar valor"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Agregar otro valor */}
                                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`feature-${option.id}`}
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                >
                                                    Nuevos valores
                                                </label>

                                                <select
                                                    id={`feature-${option.id}`}
                                                    className="w-full rounded-md border border-[#E8DDE6] bg-white p-2 text-sm text-gray-700 outline-none transition-colors focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/15"
                                                    value={newFeatureIds[option.id] ?? ''}
                                                    onChange={(event) =>
                                                        setNewFeatureIds((current) => ({
                                                            ...current,
                                                            [option.id]: event.target.value,
                                                        }))
                                                    }
                                                >
                                                    <option value="">
                                                        Seleccione un valor
                                                    </option>

                                                    {getAvailableFeatures(option).map(
                                                        (feature) => (
                                                            <option
                                                                key={feature.id}
                                                                value={feature.id}
                                                            >
                                                                {feature.description}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <Button
                                                type="button"
                                                disabled={processing}
                                                onClick={() => addFeature(option)}
                                                className="bg-[#8C5770] text-white shadow-sm hover:bg-[#75465C]"
                                            >
                                                Agregar
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            role="alert"
                            className="rounded-lg border border-[#E8DDE6] bg-[#FAF7F9] p-4 text-sm text-[#5F4665]"
                        >
                            <span className="font-semibold">Información:</span>{' '}
                            No hay opciones asociadas a este producto.
                        </div>
                    )}
                </div>
            </section>

            {/* Sección de variantes */}
            <section className="mt-12 rounded-lg border border-[#E8DDE6] bg-white shadow-sm">
                <header className="border-b border-[#E8DDE6] px-6 py-3">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Variantes
                    </h2>
                </header>

                <div className="p-6">
                    <ul className="divide-y divide-[#E8DDE6]">
                        {product.variants.map((variant) => (
                            <li
                                key={variant.id}
                                className="flex items-center gap-4 py-4"
                            >
                                <img
                                    src={variant.image}
                                    alt="Imagen de la variante"
                                    className="h-12 w-12 rounded-lg border border-[#E8DDE6] object-cover"
                                />

                                <div className="flex flex-wrap gap-2">
                                    {variant.features.length > 0 ? (
                                        variant.features.map((feature) => (
                                            <span
                                                key={feature.id}
                                                className="text-sm text-gray-700"
                                            >
                                                {feature.description}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-700">
                                            Variante principal
                                        </span>
                                    )}
                                </div>

                                <a
                                    href={`/admin/products/${product.id}/variants/${variant.id}`}
                                    className="ml-auto inline-flex items-center rounded-md bg-[#D5C5D9] px-4 py-2 text-sm font-medium text-[#5F4665] shadow-sm transition-colors hover:bg-[#C8B3CE]"
                                >
                                    Editar
                                </a>
                            </li>
                        ))}
                    </ul>

                    {product.variants.length === 0 && (
                        <p className="rounded-lg border border-[#E8DDE6] bg-[#FAF7F9] p-4 text-sm text-[#5F4665]">
                            Este producto todavía no tiene variantes.
                        </p>
                    )}
                </div>
            </section>

            {/* Modal para agregar una opción */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg border border-[#E8DDE6] bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#E8DDE6] p-4">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Agregar nueva opción
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-500 transition-colors hover:text-[#8C5770]"
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label
                                    htmlFor="option_id"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Opción
                                </label>

                                <select
                                    id="option_id"
                                    className="w-full rounded-md border border-[#E8DDE6] bg-white p-2 text-sm text-gray-700 outline-none transition-colors focus:border-[#8C5770] focus:ring-2 focus:ring-[#8C5770]/15"
                                    value={selectedOptionId}
                                    onChange={(event) => {
                                        setSelectedOptionId(event.target.value);
                                        setSelectedFeatureIds([]);
                                    }}
                                >
                                    <option value="">
                                        Seleccione una opción
                                    </option>

                                    {availableOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center gap-3">
                                    <hr className="flex-1 border-[#E8DDE6]" />
                                    <span className="text-sm text-gray-500">
                                        Valores
                                    </span>
                                    <hr className="flex-1 border-[#E8DDE6]" />
                                </div>

                                {selectedOption ? (
                                    selectedOption.features.length > 0 ? (
                                        <div className="max-h-60 space-y-2 overflow-y-auto">
                                            {selectedOption.features.map(
                                                (feature) => (
                                                    <label
                                                        key={feature.id}
                                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8DDE6] p-3 text-sm text-gray-700 transition-colors hover:bg-[#FAF7F9]"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="accent-[#8C5770]"
                                                            checked={selectedFeatureIds.includes(
                                                                feature.id
                                                            )}
                                                            onChange={() =>
                                                                toggleFeature(feature.id)
                                                            }
                                                        />

                                                        <span>
                                                            {feature.description}
                                                        </span>
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Esta opción no tiene valores disponibles.
                                        </p>
                                    )
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Primero seleccione una opción.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[#E8DDE6] p-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                className="border-[#D5C5D9] text-[#5F4665] hover:bg-[#FAF7F9]"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="button"
                                onClick={saveOption}
                                disabled={processing}
                                className="bg-[#8C5770] text-white shadow-sm hover:bg-[#75465C]"
                            >
                                {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
