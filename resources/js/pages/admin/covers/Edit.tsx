import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Camera } from 'lucide-react';

interface Cover {
    id: number;
    image: string;
    title: string;
    start_at: string;
    end_at: string | null;
    is_active: boolean;
}

interface Props {
    cover: Cover;
}

export default function Edit({ cover }: Props) {
    const { data, setData, transform, post, processing, errors } = useForm({
        image: null as File | null,
        title: cover.title,
        start_at: cover.start_at.slice(0, 10),
        end_at: cover.end_at ? cover.end_at.slice(0, 10) : '',
        is_active: cover.is_active,
    });

    const [preview, setPreview] = useState(cover.image);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        transform((data) => ({
            ...data,
            _method: 'put',
        }));

        post(`/admin/covers/${cover.id}`, {
            forceFormData: true,
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
                    name: 'Portadas',
                    route: '/admin/covers',
                },
                {
                    name: 'Editar',
                },
            ]}
        >
            <Head title="Editar portada" />

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Imagen */}
                    <figure className="relative mb-4">
                        <div className="absolute right-4 top-4 z-10">
                            <label className="flex cursor-pointer items-center rounded-lg bg-[#D5C5D9] px-4 py-2.5 text-sm font-medium text-[#5F4665] shadow-md transition-colors hover:bg-[#C8B3CE]">
                                <Camera size={18} className="mr-2" />
                                Actualizar imagen

                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>

                        <img
                            src={preview}
                            alt="Portada"
                            className="aspect-[3/1] w-full rounded-lg object-cover object-center"
                        />
                    </figure>

                    {errors.image && (
                        <p className="mb-4 text-sm text-red-600">
                            {errors.image}
                        </p>
                    )}

                    {/* Título */}
                    <div className="mb-4">
                        <label
                            htmlFor="title"
                            className="mb-1 block font-medium"
                        >
                            Título
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            placeholder="Por favor ingrese el título de la portada"
                        />

                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Fecha de inicio */}
                    <div className="mb-4">
                        <label
                            htmlFor="start_at"
                            className="mb-1 block font-medium"
                        >
                            Fecha de inicio
                        </label>

                        <input
                            id="start_at"
                            type="date"
                            value={data.start_at}
                            onChange={(event) =>
                                setData('start_at', event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />

                        {errors.start_at && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.start_at}
                            </p>
                        )}
                    </div>

                    {/* Fecha de fin */}
                    <div className="mb-4">
                        <label
                            htmlFor="end_at"
                            className="mb-1 block font-medium"
                        >
                            Fecha fin (opcional)
                        </label>

                        <input
                            id="end_at"
                            type="date"
                            value={data.end_at}
                            onChange={(event) =>
                                setData('end_at', event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />

                        {errors.end_at && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.end_at}
                            </p>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="mb-4 flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="is_active"
                                checked={data.is_active === true}
                                onChange={() => setData('is_active', true)}
                            />
                            Activo
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="is_active"
                                checked={data.is_active === false}
                                onChange={() => setData('is_active', false)}
                            />
                            Inactivo
                        </label>
                    </div>

                    {errors.is_active && (
                        <p className="mb-4 text-sm text-red-600">
                            {errors.is_active}
                        </p>
                    )}

                    {/* Botón */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#8C5770] px-5 py-2 text-white transition-colors hover:bg-[#75465C] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}