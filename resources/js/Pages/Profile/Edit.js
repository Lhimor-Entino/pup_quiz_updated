import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
export default function Edit({ mustVerifyEmail, status, }) {
    return (_jsxs(AuthenticatedLayout, { header: _jsx("h2", { className: "text-xl font-semibold leading-tight text-gray-800", children: "Profile" }), children: [_jsx(Head, { title: "Profile" }), _jsx("div", { className: "py-12", children: _jsxs("div", { className: "mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8", children: [_jsx("div", { className: "bg-white p-4 shadow sm:rounded-lg sm:p-8", children: _jsx(UpdateProfileInformationForm, { mustVerifyEmail: mustVerifyEmail, status: status, className: "max-w-xl" }) }), _jsx("div", { className: "bg-white p-4 shadow sm:rounded-lg sm:p-8", children: _jsx(UpdatePasswordForm, { className: "max-w-xl" }) }), _jsx("div", { className: "bg-white p-4 shadow sm:rounded-lg sm:p-8", children: _jsx(DeleteUserForm, { className: "max-w-xl" }) })] }) })] }));
}
