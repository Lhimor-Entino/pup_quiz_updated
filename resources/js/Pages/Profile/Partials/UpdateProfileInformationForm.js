import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '', }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });
    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };
    return (_jsxs("section", { className: className, children: [_jsxs("header", { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Profile Information" }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Update your account's profile information and email address." })] }), _jsxs("form", { onSubmit: submit, className: "mt-6 space-y-6", children: [_jsxs("div", { children: [_jsx(InputLabel, { htmlFor: "name", value: "Name" }), _jsx(TextInput, { id: "name", className: "mt-1 block w-full", value: data.name, onChange: (e) => setData('name', e.target.value), required: true, isFocused: true, autoComplete: "name" }), _jsx(InputError, { className: "mt-2", message: errors.name })] }), _jsxs("div", { children: [_jsx(InputLabel, { htmlFor: "email", value: "Email" }), _jsx(TextInput, { id: "email", type: "email", className: "mt-1 block w-full", value: data.email, onChange: (e) => setData('email', e.target.value), required: true, autoComplete: "username" }), _jsx(InputError, { className: "mt-2", message: errors.email })] }), mustVerifyEmail && user.email_verified_at === null && (_jsxs("div", { children: [_jsxs("p", { className: "mt-2 text-sm text-gray-800", children: ["Your email address is unverified.", _jsx(Link, { href: route('verification.send'), method: "post", as: "button", className: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2", children: "Click here to re-send the verification email." })] }), status === 'verification-link-sent' && (_jsx("div", { className: "mt-2 text-sm font-medium text-green-600", children: "A new verification link has been sent to your email address." }))] })), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(PrimaryButton, { disabled: processing, children: "Save" }), _jsx(Transition, { show: recentlySuccessful, enter: "transition ease-in-out", enterFrom: "opacity-0", leave: "transition ease-in-out", leaveTo: "opacity-0", children: _jsx("p", { className: "text-sm text-gray-600", children: "Saved." }) })] })] })] }));
}
