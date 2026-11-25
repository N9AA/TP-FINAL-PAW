import { Link } from '@inertiajs/react';

interface BreadcrumbItem {
    name: string;
    route?: string;
}

interface Props {
    breadcrumbs: BreadcrumbItem[];
}

export default function Breadcrumb({ breadcrumbs }: Props) {
    return (
        <>
            {breadcrumbs.length > 0 && (
                <nav className="mb-4">
                    <ol className="flex flex-wrap">
                        {breadcrumbs.map((item, index) => (
                            <li
                                key={index}
                                className={`text-sm leading-normal text-slate-700 ${
                                    index > 0
                                        ? "pl-2 before:float-left before:pr-2 before:content-['/']"
                                        : ''
                                }`}
                            >
                                {item.route ? (
                                    <Link
                                        href={item.route}
                                        className="opacity-50"
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    item.name
                                )}
                            </li>
                        ))}
                    </ol>

                    {breadcrumbs.length > 1 && (
                        <h6 className="font-bold">
                            {breadcrumbs[breadcrumbs.length - 1].name}
                        </h6>
                    )}
                </nav>
            )}
        </>
    );
}