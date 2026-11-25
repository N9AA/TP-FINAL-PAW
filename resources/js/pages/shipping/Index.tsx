import { useEffect, useState, type FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import Swal from 'sweetalert2';

import {
    Home,
    Star,
    Pencil,
    Trash2,
    Plus,
    ShoppingCart,
} from 'lucide-react';

interface ReceiverInfo {
    name: string;
    last_name: string;
    document_type: number | string;
    document: string;
    phone: string;
}

interface Address {
    id: number;
    type: number;
    description: string;
    province: string;
    city: string;
    reference: string;
    receiver: string;
    receiver_info: ReceiverInfo;
    default: boolean;
}

interface User {
    name: string;
    last_name: string;
    document_type: number | string;
    document: string;
    phone: string;
}

interface CartItem {
    rowId: string;
    id: number;
    name: string;
    qty: number;
    price: number;
    options: {
        image?: string;
        sku?: string;
        variant_id?: number;
        stock?: number;
        features?: Record<string, string> | string[];
    };
}

interface Props {
    addresses: Address[];
    user: User;
    cartItems: CartItem[];
    cartCount: number;
    cartSubtotal: number;
}

interface AddressFormData {
    type: number;
    description: string;
    province: string;
    city: string;
    reference: string;
    receiver: string;
    receiver_info: ReceiverInfo;
    default: boolean;
}

const emptyReceiver: ReceiverInfo = {
    name: '',
    last_name: '',
    document_type: '',
    document: '',
    phone: '',
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2,
    }).format(price);

export default function Index({
    addresses,
    user,
    cartItems,
    cartCount,
    cartSubtotal,
}: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<number | null>(null);

    const [selectedAddress, setSelectedAddress] = useState<number | null>(
        addresses.find((address) => address.default)?.id ??
            addresses[0]?.id ??
            null,
    );

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<AddressFormData>({
        type: 1,
        description: '',
        province: '',
        city: '',
        reference: '',
        receiver: '1',
        receiver_info: {
            name: user.name,
            last_name: user.last_name,
            document_type: user.document_type,
            document: user.document,
            phone: user.phone,
        },
        default: addresses.length === 0,
    });

    // Actualiza el stock del carrito periódicamente.
    useEffect(() => {
        const interval = window.setInterval(() => {
            router.reload({
                only: ['cartItems', 'cartCount', 'cartSubtotal'],
            });
        }, 10000);

        return () => window.clearInterval(interval);
    }, []);

    // Comprueba si alguna variante tiene stock insuficiente.
    const hasInsufficientStock = cartItems.some((item) => {
        const stock = Number(item.options.stock ?? 0);

        return (
            !item.options.variant_id ||
            stock <= 0 ||
            item.qty > stock
        );
    });

    const openCreateForm = () => {
        setEditingAddress(null);
        clearErrors();
        reset();

        setData({
            type: 1,
            description: '',
            province: '',
            city: '',
            reference: '',
            receiver: '1',
            receiver_info: {
                name: user.name,
                last_name: user.last_name,
                document_type: user.document_type,
                document: user.document,
                phone: user.phone,
            },
            default: addresses.length === 0,
        });

        setShowForm(true);
    };

    const openEditForm = (address: Address) => {
        setEditingAddress(address.id);
        clearErrors();

        setData({
            type: address.type,
            description: address.description,
            province: address.province,
            city: address.city,
            reference: address.reference,
            receiver: String(address.receiver),
            receiver_info: {
                name: address.receiver_info?.name ?? '',
                last_name: address.receiver_info?.last_name ?? '',
                document_type: address.receiver_info?.document_type ?? '',
                document: address.receiver_info?.document ?? '',
                phone: address.receiver_info?.phone ?? '',
            },
            default: address.default,
        });

        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingAddress(null);
        clearErrors();
        reset();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingAddress !== null) {
            put(`/shipping/${editingAddress}`, {
                onSuccess: () => closeForm(),
            });
        } else {
            post('/shipping', {
                onSuccess: () => closeForm(),
            });
        }
    };

    const handleDelete = (addressId: number) => {
        Swal.fire({
            title: '¿Eliminar dirección?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9D6C83',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/shipping/${addressId}`, {
                    onSuccess: () => {
                        if (selectedAddress === addressId) {
                            setSelectedAddress(null);
                        }
                    },
                });
            }
        });
    };

    const handleSetDefault = (addressId: number) => {
        router.patch(`/shipping/${addressId}/default`);
    };

    const updateReceiver = (receiver: string) => {
        setData('receiver', receiver);

        if (receiver === '1') {
            setData('receiver_info', {
                name: user.name,
                last_name: user.last_name,
                document_type: user.document_type,
                document: user.document,
                phone: user.phone,
            });
        } else {
            setData('receiver_info', { ...emptyReceiver });
        }
    };

    const updateReceiverInfo = (
        field: keyof ReceiverInfo,
        value: string | number,
    ) => {
        setData('receiver_info', {
            ...data.receiver_info,
            [field]: value,
        });
    };

    const handleContinue = () => {
        if (!selectedAddress) {
            Swal.fire(
                'Atención',
                'Seleccioná una dirección de envío.',
                'warning',
            );
            return;
        }

        if (cartItems.length === 0) {
            Swal.fire(
                'Carrito vacío',
                'Agregá productos antes de continuar.',
                'warning',
            );
            return;
        }

        if (hasInsufficientStock) {
            Swal.fire(
                'Stock insuficiente',
                'Hay productos que ya no tienen stock suficiente. Volvé al carrito para modificar las cantidades.',
                'warning',
            );
            return;
        }

        router.visit(`/checkout?address_id=${selectedAddress}`);
    };

    const inputClass =
        'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#9D6C83] focus:ring-1 focus:ring-[#E8D1DD]';

    return (
        <StoreLayout>
            <Head title="Dirección de envío" />

            <div className="mx-auto mt-12 max-w-7xl px-4 pb-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Direcciones de envío */}
                    <div className="md:col-span-2">
                        <section className="overflow-hidden rounded-lg bg-white shadow">
                            <header className="bg-[#9D6C83] px-4 py-3">
                                <h2 className="text-lg font-semibold text-white">
                                    Direcciones de envío guardadas
                                </h2>
                            </header>

                            <div className="p-4">
                                {showForm ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-1">
                                                <select
                                                    value={data.type}
                                                    onChange={(event) =>
                                                        setData(
                                                            'type',
                                                            Number(event.target.value),
                                                        )
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option value="">
                                                        Tipo de dirección
                                                    </option>
                                                    <option value={1}>
                                                        Domicilio
                                                    </option>
                                                    <option value={2}>
                                                        Oficina
                                                    </option>
                                                </select>

                                                {errors.type && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {errors.type}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    value={data.description}
                                                    onChange={(event) =>
                                                        setData(
                                                            'description',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Nombre de la dirección"
                                                    className={inputClass}
                                                />

                                                {errors.description && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {errors.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    value={data.province}
                                                    onChange={(event) =>
                                                        setData(
                                                            'province',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Provincia"
                                                    className={inputClass}
                                                />

                                                {errors.province && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {errors.province}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    value={data.city}
                                                    onChange={(event) =>
                                                        setData(
                                                            'city',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Ciudad o localidad"
                                                    className={inputClass}
                                                />

                                                {errors.city && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {errors.city}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    value={data.reference}
                                                    onChange={(event) =>
                                                        setData(
                                                            'reference',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Referencia"
                                                    className={inputClass}
                                                />

                                                {errors.reference && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {errors.reference}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <hr className="my-4 border-gray-200" />

                                        <div>
                                            <p className="mb-2 font-semibold text-gray-800">
                                                ¿Quién recibirá el pedido?
                                            </p>

                                            <div className="mb-4 flex gap-4 text-sm">
                                                <label className="flex cursor-pointer items-center">
                                                    <input
                                                        type="radio"
                                                        name="receiver"
                                                        value="1"
                                                        checked={data.receiver === '1'}
                                                        onChange={() =>
                                                            updateReceiver('1')
                                                        }
                                                        className="mr-1 accent-[#9D6C83]"
                                                    />
                                                    Seré yo
                                                </label>

                                                <label className="flex cursor-pointer items-center">
                                                    <input
                                                        type="radio"
                                                        name="receiver"
                                                        value="2"
                                                        checked={data.receiver === '2'}
                                                        onChange={() =>
                                                            updateReceiver('2')
                                                        }
                                                        className="mr-1 accent-[#9D6C83]"
                                                    />
                                                    Otra persona
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={data.receiver_info.name}
                                                        onChange={(event) =>
                                                            updateReceiverInfo(
                                                                'name',
                                                                event.target.value,
                                                            )
                                                        }
                                                        disabled={data.receiver === '1'}
                                                        placeholder="Nombres"
                                                        className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                                                    />

                                                    {errors['receiver_info.name'] && (
                                                        <p className="mt-1 text-xs text-red-600">
                                                            {errors['receiver_info.name']}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <input
                                                        type="text"
                                                        value={data.receiver_info.last_name}
                                                        onChange={(event) =>
                                                            updateReceiverInfo(
                                                                'last_name',
                                                                event.target.value,
                                                            )
                                                        }
                                                        disabled={data.receiver === '1'}
                                                        placeholder="Apellidos"
                                                        className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                                                    />

                                                    {errors['receiver_info.last_name'] && (
                                                        <p className="mt-1 text-xs text-red-600">
                                                            {errors['receiver_info.last_name']}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <select
                                                        value={data.receiver_info.document_type}
                                                        onChange={(event) =>
                                                            updateReceiverInfo(
                                                                'document_type',
                                                                event.target.value === ''
                                                                    ? ''
                                                                    : Number(event.target.value),
                                                            )
                                                        }
                                                        disabled={data.receiver === '1'}
                                                        className="w-28 rounded-md border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-[#9D6C83] focus:ring-1 focus:ring-[#E8D1DD] disabled:bg-gray-100"
                                                    >
                                                        <option value="">Tipo</option>
                                                        <option value={1}>DNI</option>
                                                        <option value={2}>CE</option>
                                                        <option value={3}>RUC</option>
                                                        <option value={4}>PP</option>
                                                        <option value={5}>LE</option>
                                                        <option value={6}>ID</option>
                                                    </select>

                                                    <input
                                                        type="text"
                                                        value={data.receiver_info.document}
                                                        onChange={(event) =>
                                                            updateReceiverInfo(
                                                                'document',
                                                                event.target.value,
                                                            )
                                                        }
                                                        disabled={data.receiver === '1'}
                                                        placeholder="Número de documento"
                                                        className={`min-w-0 flex-1 ${inputClass} disabled:bg-gray-100`}
                                                    />
                                                </div>

                                                {errors['receiver_info.document'] && (
                                                    <p className="text-xs text-red-600">
                                                        {errors['receiver_info.document']}
                                                    </p>
                                                )}

                                                <div>
                                                    <input
                                                        type="text"
                                                        value={data.receiver_info.phone}
                                                        onChange={(event) =>
                                                            updateReceiverInfo(
                                                                'phone',
                                                                event.target.value,
                                                            )
                                                        }
                                                        disabled={data.receiver === '1'}
                                                        placeholder="Teléfono"
                                                        className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                                                    />

                                                    {errors['receiver_info.phone'] && (
                                                        <p className="mt-1 text-xs text-red-600">
                                                            {errors['receiver_info.phone']}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4 border-gray-200" />

                                        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={data.default}
                                                onChange={(event) =>
                                                    setData(
                                                        'default',
                                                        event.target.checked,
                                                    )
                                                }
                                                className="accent-[#9D6C83]"
                                            />
                                            Establecer como dirección predeterminada
                                        </label>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={closeForm}
                                                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full rounded-md bg-[#9D6C83] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#85576D] disabled:opacity-50"
                                            >
                                                {processing
                                                    ? 'Guardando...'
                                                    : editingAddress !== null
                                                      ? 'Actualizar'
                                                      : 'Guardar'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {addresses.length > 0 ? (
                                            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                {addresses.map((address) => (
                                                    <li
                                                        key={address.id}
                                                        onClick={() =>
                                                            setSelectedAddress(address.id)
                                                        }
                                                        className={`cursor-pointer rounded-lg border-2 shadow transition-colors ${
                                                            selectedAddress === address.id
                                                                ? 'border-[#9D6C83] bg-[#F2E8ED]'
                                                                : 'border-transparent bg-white hover:border-[#E8DDE6]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center p-3">
                                                            <div className="shrink-0">
                                                                <Home
                                                                    size={20}
                                                                    className="text-[#9D6C83]"
                                                                />
                                                            </div>

                                                            <div className="mx-3 min-w-0 flex-1 text-xs">
                                                                <p className="text-[#9D6C83]">
                                                                    {address.type === 1
                                                                        ? 'Domicilio'
                                                                        : 'Oficina'}
                                                                </p>

                                                                <p className="truncate font-semibold text-gray-700">
                                                                    {address.province}
                                                                </p>

                                                                <p className="truncate font-semibold text-gray-700">
                                                                    {address.city}
                                                                </p>

                                                                <p className="truncate font-semibold text-gray-700">
                                                                    {address.description}
                                                                </p>

                                                                <p className="truncate text-gray-600">
                                                                    {address.receiver_info?.name}
                                                                </p>
                                                            </div>

                                                            <div
                                                                className="flex shrink-0 flex-col items-center gap-1 text-gray-800"
                                                                onClick={(event) =>
                                                                    event.stopPropagation()
                                                                }
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleSetDefault(address.id)
                                                                    }
                                                                    title="Establecer como predeterminada"
                                                                    className={
                                                                        address.default
                                                                            ? 'text-yellow-500'
                                                                            : 'text-gray-700 hover:text-yellow-500'
                                                                    }
                                                                >
                                                                    <Star
                                                                        size={14}
                                                                        fill={
                                                                            address.default
                                                                                ? 'currentColor'
                                                                                : 'none'
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditForm(address)
                                                                    }
                                                                    title="Editar dirección"
                                                                    className="text-gray-600 transition-colors hover:text-[#9D6C83]"
                                                                >
                                                                    <Pencil size={13} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(address.id)
                                                                    }
                                                                    title="Eliminar dirección"
                                                                    className="text-gray-600 transition-colors hover:text-red-600"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="py-4 text-center text-sm text-gray-500">
                                                No se han encontrado direcciones.
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={openCreateForm}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-[#E8DDE6] px-4 py-2 text-sm font-semibold text-[#9D6C83] transition-colors hover:bg-[#FAF7F9]"
                                        >
                                            Agregar
                                            <Plus size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Resumen de compra */}
                    <div className="md:col-span-1">
                        <div className="mb-4 overflow-hidden rounded-lg bg-white shadow">
                            <header className="flex items-center justify-between bg-[#9D6C83] p-4 text-white">
                                <p className="font-semibold">
                                    Resumen de compra ({cartCount})
                                </p>

                                <Link
                                    href="/cart"
                                    title="Volver al carrito"
                                    className="transition-colors hover:text-[#E8D1DD]"
                                >
                                    <ShoppingCart size={18} />
                                </Link>
                            </header>

                            <div className="p-4 text-gray-600">
                                <ul className="space-y-4">
                                    {cartItems.map((item) => {
                                        const stock = Number(
                                            item.options.stock ?? 0,
                                        );

                                        const insufficient =
                                            !item.options.variant_id ||
                                            stock <= 0 ||
                                            item.qty > stock;

                                        return (
                                            <li
                                                key={item.rowId}
                                                className="flex items-center gap-3"
                                            >
                                                <figure className="shrink-0">
                                                    {item.options.image ? (
                                                        <img
                                                            src={
                                                                item.options.image.startsWith('http')
                                                                    ? item.options.image
                                                                    : `/storage/${item.options.image.replace(/^\/?storage\//, '')}`
                                                            }
                                                            alt={item.name}
                                                            className="aspect-square h-12 w-12 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center bg-gray-100 text-xs text-gray-400">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </figure>

                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-2 text-xs">
                                                        {item.name}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {formatPrice(item.price)}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        Stock disponible: {stock}
                                                    </p>

                                                    {insufficient && (
                                                        <p className="mt-1 text-xs font-semibold text-red-600">
                                                            Stock insuficiente. Modificá la cantidad en el carrito.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="shrink-0 text-xs">
                                                    {item.qty}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {hasInsufficientStock && (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                        <p className="text-sm font-semibold text-red-700">
                                            Hay productos sin stock suficiente.
                                        </p>

                                        <p className="mt-1 text-xs text-red-600">
                                            Volvé al carrito para modificar las cantidades antes de continuar.
                                        </p>

                                        <Link
                                            href="/cart"
                                            className="mt-2 inline-block text-sm font-semibold text-[#9D6C83] underline"
                                        >
                                            Ir al carrito
                                        </Link>
                                    </div>
                                )}

                                <hr className="my-4 border-gray-200" />

                                <div className="flex items-center justify-between">
                                    <p className="text-base">Total</p>

                                    <p className="text-sm font-semibold">
                                        {formatPrice(cartSubtotal)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={
                                !selectedAddress ||
                                cartItems.length === 0 ||
                                hasInsufficientStock
                            }
                            className="block w-full rounded-lg bg-[#9D6C83] px-4 py-2 text-center font-medium text-white transition-colors duration-200 hover:bg-[#85576D] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}