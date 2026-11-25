
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import {
    Plus,
    Trash2,
    X,
    PlusCircle,
} from 'lucide-react';

import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import AddNewFeature from './AddNewFeature';

interface Feature {
    id: number;
    value: string;
    description: string;
}

interface Option {
    id: number;
    name: string;
    type: number;
    features: Feature[];
}

interface Props {
    options: Option[];
}

interface FeatureForm {
    value: string;
    description: string;
}

interface OptionForm {
    name: string;
    type: number;
    features: FeatureForm[];
}

export default function Index({ options }: Props) {
    const [openModal, setOpenModal] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<OptionForm>({
        name: '',
        type: 1,
        features: [
            {
                value: '',
                description: '',
            },
        ],
    });

    // Agregar un valor al formulario
    const addFeature = () => {
        setData('features', [
            ...data.features,
            {
                value: '',
                description: '',
            },
        ]);
    };

    // Eliminar un valor del formulario
    const removeFeature = (index: number) => {
        setData(
            'features',
            data.features.filter((_, i) => i !== index),
        );
    };

    // Abrir modal
    const handleOpenModal = () => {
        reset();
        clearErrors();
        setOpenModal(true);
    };

    // Crear opción
    const addOption = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/admin/options', {
            preserveScroll: true,
            onSuccess: () => {
                setOpenModal(false);
                reset();

                Swal.fire({
                    icon: 'success',
                    title: '¡Bien hecho!',
                    text: 'La opción se agregó correctamente',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#8C5770',
                });
            },
        });
    };

    // Eliminar opción o valor
    const confirmDelete = (
        id: number,
        type: 'option' | 'feature',
    ) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8C5770',
            cancelButtonColor: '#D5C5D9',
            confirmButtonText: '¡Sí, bórralo!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                const url =
                    type === 'option'
                        ? `/admin/options/${id}`
                        : `/admin/features/${id}`;

                router.delete(url, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminado!',
                            text:
                                type === 'option'
                                    ? 'La opción se eliminó correctamente'
                                    : 'El valor se eliminó correctamente',
                            confirmButtonText: 'Aceptar',
                            confirmButtonColor: '#8C5770',
                        });
                    },
                });
            }
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    name: 'Dashboard',
                    route: '/admin',
                },
                {
                    name: 'Opciones',
                },
            ]}
        >
            <Head title="Opciones" />

            <section className="overflow-hidden rounded-lg bg-white shadow-sm">

                {/* Encabezado */}
                <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h1 className="text-lg font-semibold text-gray-700">
                        Opciones
                    </h1>

                    <Button
                        type="button"
                        onClick={handleOpenModal}
                        className="text-white"
                        style={{
                            backgroundColor: '#8C5770',
                            color: '#FFFFFF',
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo
                    </Button>
                </header>

                {/* Listado de opciones */}
                <div className="p-6">
                    <div className="space-y-6">

                        {options.map((option) => (
                            <div
                                key={option.id}
                                className="relative rounded-lg border border-gray-200 p-6"
                            >

                                {/* Nombre de la opción */}
                                <div className="absolute -top-3 left-4 flex items-center gap-2 bg-white px-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            confirmDelete(option.id, 'option')
                                        }
                                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2BFBD] text-[#75465C] transition hover:bg-[#EBAEAB]"
                                        title="Eliminar opción"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>

                                    <span className="font-semibold text-gray-700">
                                        {option.name}
                                    </span>
                                </div>

                                {/* Valores */}
                                <div className="mb-4 flex flex-wrap gap-4">
                                    {option.features.map((feature) => (
                                        <div key={feature.id}>
                                            {option.type === 1 ? (
                                                /* Valores de texto */
                                                <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-[#F9F6F8] px-3 py-1.5 text-xs font-medium text-gray-700">
                                                    {feature.description}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            confirmDelete(
                                                                feature.id,
                                                                'feature',
                                                            )
                                                        }
                                                        className="flex h-5 w-5 items-center justify-center rounded bg-[#F2BFBD] text-[#75465C] transition hover:bg-[#EBAEAB]"
                                                        title="Eliminar valor"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ) : (
                                                /* Valores de color */
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <span
                                                            className="block h-8 w-8 rounded-full border-2 border-gray-200 shadow-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    feature.value,
                                                            }}
                                                            title={feature.description}
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    feature.id,
                                                                    'feature',
                                                                )
                                                            }
                                                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F2BFBD] text-[#75465C] transition hover:bg-[#EBAEAB]"
                                                            title="Eliminar color"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>

                                                    <span className="text-xs text-gray-600">
                                                        {feature.description}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Agregar nuevos valores */}
                                <AddNewFeature option={option} />

                            </div>
                        ))}

                        {options.length === 0 && (
                            <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
                                <p className="text-sm text-gray-500">
                                    Todavía no hay opciones registradas.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </section>

            {/* Modal para crear opción */}
            <Dialog
                open={openModal}
                onOpenChange={setOpenModal}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">

                    <DialogHeader>
                        <DialogTitle className="text-gray-800">
                            Crear nueva opción
                        </DialogTitle>

                        <DialogDescription>
                            Completá los datos de la opción y agregá sus valores.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={addOption}>

                        {/* Nombre y tipo */}
                        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Nombre
                                </label>

                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Por ejemplo: Tamaño, Color"
                                />

                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Tipo
                                </label>

                                <select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData('type', Number(e.target.value))
                                    }
                                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#8C5770] focus:ring-1 focus:ring-[#8C5770]"
                                >
                                    <option value={1}>Texto</option>
                                    <option value={2}>Color</option>
                                </select>

                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Separador */}
                        <div className="mb-6 flex items-center">
                            <hr className="flex-1 border-gray-200" />

                            <span className="mx-4 text-sm font-semibold text-gray-600">
                                Valores
                            </span>

                            <hr className="flex-1 border-gray-200" />
                        </div>

                        {/* Valores dinámicos */}
                        <div className="mb-4 space-y-4">

                            {data.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-lg border border-gray-200 p-6"
                                >

                                    <div className="absolute -top-3 left-4 bg-white px-2">
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2BFBD] text-[#75465C] transition hover:bg-[#EBAEAB]"
                                            title="Quitar valor"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                                        {/* Valor */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Valor
                                            </label>

                                            {data.type === 1 ? (
                                                <Input
                                                    value={feature.value}
                                                    onChange={(e) => {
                                                        const updated = [...data.features];

                                                        updated[index] = {
                                                            ...updated[index],
                                                            value: e.target.value,
                                                        };

                                                        setData('features', updated);
                                                    }}
                                                    placeholder="Ingrese el valor"
                                                />
                                            ) : (
                                                <div className="flex h-10 items-center justify-between rounded-md border border-gray-300 px-3">
                                                    <span className="text-sm text-gray-600">
                                                        {feature.value ||
                                                            'Seleccione un color'}
                                                    </span>

                                                    <input
                                                        type="color"
                                                        value={feature.value || '#000000'}
                                                        onChange={(e) => {
                                                            const updated = [...data.features];

                                                            updated[index] = {
                                                                ...updated[index],
                                                                value: e.target.value,
                                                            };

                                                            setData('features', updated);
                                                        }}
                                                        className="h-7 w-10 cursor-pointer"
                                                    />
                                                </div>
                                            )}

                                            {errors[`features.${index}.value` as keyof typeof errors] && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors[`features.${index}.value` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Descripción
                                            </label>

                                            <Input
                                                value={feature.description}
                                                onChange={(e) => {
                                                    const updated = [...data.features];

                                                    updated[index] = {
                                                        ...updated[index],
                                                        description: e.target.value,
                                                    };

                                                    setData('features', updated);
                                                }}
                                                placeholder="Ingrese una descripción"
                                            />

                                            {errors[`features.${index}.description` as keyof typeof errors] && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors[`features.${index}.description` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Agregar valor */}
                        <div className="mb-6 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addFeature}
                                className="border-[#8C5770] text-[#8C5770] hover:bg-[#F9F3F6] hover:text-[#75465C]"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar valor
                            </Button>
                        </div>

                        {/* Botones del modal */}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpenModal(false)}
                            >
                                Cancelar
                            </Button>

                            {/* Botón nativo para evitar las clases azules de Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border-0 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    backgroundColor: '#8C5770',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#75465C';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#8C5770';
                                }}
                            >
                                {processing ? 'Guardando...' : 'Agregar'}
                            </button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}
