import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#FAF7F9] p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-widest text-[#9D6C83]">
                            MERAKI
                        </h1>

                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-medium text-gray-800">
                                {title}
                            </h2>

                            <p className="text-center text-sm text-gray-500">
                                {description}
                            </p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}