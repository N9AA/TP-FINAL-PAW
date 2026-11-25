
import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import StoreLayout from '@/layouts/store-layout';
import Container from '@/components/ui/container';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Cover {
    id: number;
    image: string;
    title: string;
}

interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
}

interface Props {
    covers: Cover[];
    lastProducts: Product[];
}

export default function Welcome({ covers, lastProducts }: Props) {
    return (
        <>
            <Head title="Meraki - Tienda Online" />

            <main className="min-h-screen bg-gray-50">

                {/* Carrusel de portadas */}
                {covers.length > 0 && (
                    <Swiper
                        className="mb-12"
                        modules={[Autoplay, Pagination, Navigation]}
                        loop={covers.length > 1}
                        autoplay={{
                            delay: 8000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        navigation
                    >
                        {covers.map((cover) => (
                            <SwiperSlide key={cover.id}>
                                <img
                                    src={cover.image}
                                    alt={cover.title}
                                    className="aspect-[3/1] w-full object-cover object-center"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}

                {/* Últimos productos */}
                <Container>
                    <h1 className="mb-4 text-2xl font-bold text-gray-700">
                        Últimos productos
                    </h1>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                        {lastProducts.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded bg-white shadow"
                            >
                                <img
                                    src={`${product.image}?v=${Date.now()}`}
                                    alt={product.name}
                                    className="h-48 w-full object-cover object-center"
                                    onLoad={() => console.log('Imagen cargada:', product.image)}
                                    onError={() => console.log('Error al cargar:', product.image)}
                                />

                                <div className="p-4">
                                    <h2 className="mb-2 min-h-[56px] line-clamp-2 text-lg font-bold text-gray-700">
                                        {product.name}
                                    </h2>

                                    <p className="mb-4 text-gray-600">
                                        $ {product.price}
                                    </p>

                                    <Link
                                        href={`/products/${product.id}`}
                                        className="block w-full rounded bg-[#9D6C83] px-4 py-2 text-center font-medium text-white transition-colors duration-200 hover:bg-[#85576D]"
                                    >
                                        Ver más
                                    </Link>
                                </div>
                            </article>
                        ))}

                    </div>
                </Container>

            </main>
        </>
    );
}

Welcome.layout = (page: ReactNode) => (
    <StoreLayout>{page}</StoreLayout>
);
