
import { Form, usePage } from '@inertiajs/react';
import { useRef } from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type PageProps = {
    isAdmin?: boolean;
};

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { isAdmin = false } = usePage<PageProps>().props;

    const deleteUrl = isAdmin ? '/admin/perfil' : '/perfil';

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Eliminar cuenta"
                description="Eliminá tu cuenta y todos sus datos"
            />

            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Advertencia</p>
                    <p className="text-sm">
                        Procedé con cuidado, esta acción no se puede deshacer.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Eliminar cuenta
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>
                            ¿Estás segura de que querés eliminar tu cuenta?
                        </DialogTitle>

                        <DialogDescription>
                            Una vez eliminada tu cuenta, todos sus recursos y
                            datos también se eliminarán permanentemente.
                            Ingresá tu contraseña para confirmar que querés
                            eliminar tu cuenta de forma definitiva.
                        </DialogDescription>

                        <Form
                            action={deleteUrl}
                            method="delete"
                            options={{ preserveScroll: true }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            Contraseña
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Contraseña"
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                Cancelar
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                Eliminar cuenta
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

