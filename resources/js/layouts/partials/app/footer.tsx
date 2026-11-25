
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-[#9D6C83] text-white">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">

                <div className="md:flex md:justify-between">

                    {/* Logo */}
                    <div className="mb-6 md:mb-0">
                        <Link
                            href="/"
                            className="inline-flex flex-col items-end text-white"
                        >
                            <span className="text-xl font-semibold leading-6 md:text-3xl">
                                Meraki
                            </span>
                            <span className="text-xs text-[#F9EEF3]">
                                Tienda Online
                            </span>
                        </Link>
                    </div>

                    {/* Enlaces legales */}
                    <div>
                        <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                            Legal
                        </h2>

                        <ul className="font-medium text-[#F9EEF3]">
                            <li className="mb-4">
                                <a
                                    href="#"
                                    className="transition-colors hover:text-[#E8D1DD] hover:underline"
                                >
                                    Política de privacidad
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-[#E8D1DD] hover:underline"
                                >
                                    Términos y condiciones
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <hr className="my-6 border-[#BF9DAD] sm:mx-auto lg:my-8" />

                {/* Copyright y redes sociales */}
                <div className="sm:flex sm:items-center sm:justify-between">

                    <span className="text-sm text-[#F9EEF3] sm:text-center">
                        © {new Date().getFullYear()}{' '}
                        <Link
                            href="/"
                            className="font-semibold text-white hover:underline"
                        >
                            Meraki
                        </Link>
                        . Todos los derechos reservados.
                    </span>

                    <div className="mt-4 flex sm:mt-0 sm:justify-center">

                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F9EEF3] transition-colors hover:text-[#E8D1DD]"
                            aria-label="Instagram"
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12 2c-2.717 0-3.056.012-4.122.06-1.065.05-1.793.217-2.428.465a4.9 4.9 0 0 0-1.772 1.153 4.9 4.9 0 0 0-1.153 1.772c-.248.635-.416 1.363-.465 2.428C2.012 8.944 2 9.283 2 12s.012 3.056.06 4.122c.05 1.065.217 1.793.465 2.428a4.9 4.9 0 0 0 1.153 1.772 4.9 4.9 0 0 0 1.772 1.153c.635.248 1.363.416 2.428.465C8.944 21.988 9.283 22 12 22s3.056-.012 4.122-.06c1.065-.05 1.793-.217 2.428-.465a5.1 5.1 0 0 0 2.925-2.925c.248-.635.416-1.363.465-2.428.048-1.066.06-1.405.06-4.122s-.012-3.056-.06-4.122c-.05-1.065-.217-1.793-.465-2.428a4.9 4.9 0 0 0-1.153-1.772 4.9 4.9 0 0 0-1.772-1.153c-.635-.248-1.363-.416-2.428-.465C15.056 2.012 14.717 2 12 2Zm0 2c2.671 0 2.986.01 4.04.058.974.044 1.504.207 1.856.344.466.181.8.398 1.15.748.35.35.567.684.748 1.15.137.352.3.882.344 1.856.048 1.054.058 1.369.058 4.04s-.01 2.986-.058 4.04c-.044.974-.207 1.504-.344 1.856a3.1 3.1 0 0 1-1.898 1.898c-.352.137-.882.3-1.856.344-1.054.048-1.369.058-4.04.058s-2.986-.01-4.04-.058c-.974-.044-1.504-.207-1.856-.344a3.1 3.1 0 0 1-1.898-1.898c-.137-.352-.3-.882-.344-1.856C3.814 14.986 3.804 14.671 3.804 12s.01-2.986.058-4.04c.044-.974.207-1.504.344-1.856.181-.466.398-.8.748-1.15.35-.35.684-.567 1.15-.748.352-.137.882-.3 1.856-.344C9.014 4.01 9.329 4 12 4Zm0 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.25-3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>

                        {/* TikTok */}
                        <a
                            href="https://www.tiktok.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-5 text-[#F9EEF3] transition-colors hover:text-[#E8D1DD]"
                            aria-label="TikTok"
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.24V2h-3.55v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9v-3.55a6.46 6.46 0 1 0 3.55 5.77V9.75a8.35 8.35 0 0 0 4.9 1.58V7.78a4.85 4.85 0 0 1-1.13-.09Z" />
                            </svg>
                        </a>

                        {/* X */}
                        <a
                            href="https://x.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-5 text-[#F9EEF3] transition-colors hover:text-[#E8D1DD]"
                            aria-label="X"
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.45L5.5 22H2.38l7.25-8.3L1.8 2h6.4l4.43 6.78L18.9 2Zm-1.1 18h1.73L7.27 3.9H5.4L17.8 20Z" />
                            </svg>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-5 text-[#F9EEF3] transition-colors hover:text-[#E8D1DD]"
                            aria-label="Facebook"
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>

                    </div>
                </div>
            </div>
        </footer>
    );
}
