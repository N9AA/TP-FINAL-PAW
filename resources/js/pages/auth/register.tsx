import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type DocumentType = {
    value: string;
    name: string;
};

type Props = {
    passwordRules: string;
    documentTypes: DocumentType[];
};

export default function Register({
    passwordRules,
    documentTypes,
}: Props) {
    return (
        <>
            <Head title="Registrarse" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="mx-auto flex w-full max-w-4xl flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Nombre */}
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-gray-700">
                                    Nombre
                                </Label>
                                <Input
                                    className="w-full border-[#E8DDE6] focus-visible:border-[#9D6C83] focus-visible:ring-[#E8D1DD]"
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="given-name"
                                    name="name"
                                    placeholder="Nombre"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Apellido */}
                            <div className="grid gap-2">
                                <Label htmlFor="last_name" className="text-gray-700">
                                    Apellido
                                </Label>
                                <Input
                                    className="w-full border-[#E8DDE6] focus-visible:border-[#9D6C83] focus-visible:ring-[#E8D1DD]"
                                    id="last_name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="family-name"
                                    name="last_name"
                                    placeholder="Apellido"
                                />
                                <InputError message={errors.last_name} />
                            </div>

                            {/* Tipo de documento */}
                            <div className="grid gap-2">
                                <Label htmlFor="document_type" className="text-gray-700">
                                    Tipo de documento
                                </Label>

                                <select
                                    id="document_type"
                                    name="document_type"
                                    required
                                    tabIndex={3}
                                    className="flex h-10 w-full rounded-md border border-[#E8DDE6] bg-white px-3 py-1 text-sm text-gray-700 shadow-xs outline-none focus-visible:border-[#9D6C83] focus-visible:ring-2 focus-visible:ring-[#E8D1DD] focus-visible:ring-offset-2"
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Seleccioná un tipo de documento
                                    </option>

                                    {documentTypes.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                <InputError message={errors.document_type} />
                            </div>

                            {/* Documento */}
                            <div className="grid gap-2">
                                <Label htmlFor="document" className="text-gray-700">
                                    Documento
                                </Label>
                                <Input
                                    className="w-full border-[#E8DDE6] focus-visible:border-[#9D6C83] focus-visible:ring-[#E8D1DD]"
                                    id="document"
                                    name="document"
                                    required
                                    tabIndex={4}
                                    autoComplete="off"
                                    placeholder="Número de documento"
                                />
                                <InputError message={errors.document} />
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-gray-700">
                                    Correo electrónico
                                </Label>
                                <Input
                                    className="w-full border-[#E8DDE6] focus-visible:border-[#9D6C83] focus-visible:ring-[#E8D1DD]"
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={5}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Teléfono */}
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-gray-700">
                                    Teléfono
                                </Label>
                                <Input
                                    className="w-full border-[#E8DDE6] focus-visible:border-[#9D6C83] focus-visible:ring-[#E8D1DD]"
                                    id="phone"
                                    name="phone"
                                    required
                                    tabIndex={6}
                                    autoComplete="tel"
                                    placeholder="Número de teléfono"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Contraseña */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-700">
                                    Contraseña
                                </Label>
                                <PasswordInput
                                    className="w-full"
                                    id="password"
                                    required
                                    tabIndex={7}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Contraseña"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-gray-700">
                                    Confirmar contraseña
                                </Label>
                                <PasswordInput
                                    className="w-full"
                                    id="password_confirmation"
                                    required
                                    tabIndex={8}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirmar contraseña"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>
                        </div>

                        {/* Botón */}
                        <Button
                            type="submit"
                            className="mt-2 w-full bg-[#9D6C83] text-white hover:bg-[#85576D]"
                            tabIndex={9}
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            Crear cuenta
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            ¿Ya tenés una cuenta?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={10}
                                className="font-medium text-[#9D6C83] hover:text-[#85576D]"
                            >
                                Iniciá sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Crear una cuenta',
    description: 'Ingresá tus datos para crear tu cuenta',
};