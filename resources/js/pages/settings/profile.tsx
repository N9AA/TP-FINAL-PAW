
import { useState, useEffect, type ChangeEvent } from 'react';
import { Form, Head, usePage, router } from '@inertiajs/react';
import { Camera, Trash2, Upload } from 'lucide-react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth & {
        user: Auth['user'] & {
            profile_photo_path: string | null;
            profile_photo_url: string | null;
        };
    };
    isAdmin: boolean;
};

export default function Profile() {
    const { auth, isAdmin } = usePage<PageProps>().props;

    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [processingPhoto, setProcessingPhoto] = useState(false);

    const photoUrl = isAdmin
        ? '/admin/perfil/photo'
        : '/perfil/photo';

    const profileUrl = isAdmin
        ? '/admin/perfil'
        : '/perfil';

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const currentPhoto = auth.user.profile_photo_url;
    const displayedPhoto = preview || currentPhoto;

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setPhotoError('Seleccioná una imagen JPG, PNG o WEBP.');
            event.target.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setPhotoError('La imagen no puede superar los 2 MB.');
            event.target.value = '';
            return;
        }

        setPhotoError(null);
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const uploadPhoto = () => {
        if (!photo) return;

        setProcessingPhoto(true);

        router.post(
            photoUrl,
            { photo },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessingPhoto(false),
                onSuccess: () => {
                    setPhoto(null);
                    setPreview(null);
                    setPhotoError(null);
                },
            },
        );
    };

    const deletePhoto = () => {
        router.delete(photoUrl, {
            preserveScroll: true,
            onSuccess: () => {
                setPhoto(null);
                setPreview(null);
                setPhotoError(null);
            },
        });
    };

    return (
        <>
            <Head title="Configuración del perfil" />

            <h1 className="sr-only">Configuración del perfil</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Perfil"
                    description="Actualizá tu nombre, correo electrónico y foto de perfil"
                />

                <div className="space-y-4">
                    <Label>Foto de perfil</Label>

                    <div className="flex flex-wrap items-center gap-5">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border bg-gray-100">
                            {displayedPhoto ? (
                                <img
                                    src={displayedPhoto}
                                    alt="Foto de perfil"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Camera className="h-9 w-9 text-gray-400" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                JPG, PNG o WEBP. Máximo 2 MB.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        document.getElementById('profile-photo')?.click()
                                    }
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Seleccionar foto
                                </Button>

                                {auth.user.profile_photo_path && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={deletePhoto}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>

                            <input
                                id="profile-photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />

                            {photoError && (
                                <p className="text-sm text-destructive">
                                    {photoError}
                                </p>
                            )}

                            {photo && (
                                <Button
                                    type="button"
                                    onClick={uploadPhoto}
                                    disabled={processingPhoto}
                                >
                                    {processingPhoto
                                        ? 'Guardando...'
                                        : 'Guardar nueva foto'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <Form
                        action={profileUrl}
                        method="patch"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Correo electrónico
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Correo electrónico"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar cambios
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Configuración del perfil',
            href: '/perfil',
        },
    ],
};
