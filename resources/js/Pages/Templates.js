import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
export default function Templates() {
    return (_jsxs(AuthenticatedLayout, { children: [_jsx(Head, { title: "Templates" }), _jsx("div", { className: "py-12", children: _jsx("div", { className: "mx-auto max-w-7xl sm:px-6 lg:px-8", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [1, 2, 3, 4].map((num) => (_jsx(Link, { href: "/newquiz", className: "block bg-white shadow rounded-lg p-4 hover:shadow-lg transition", children: _jsx("img", { src: "https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg", alt: `Template ${num}`, className: "w-full h-40 object-cover mb-4 rounded" }) }, num))) }) }) })] }));
}
