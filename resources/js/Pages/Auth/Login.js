import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Footer from '@/CustomComponents/Footer';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
export default function Login({ status, canResetPassword, }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Incorrect email or password',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#fff',
                    color: '#e3342f',
                    iconColor: '#e3342f',
                });
            },
        });
    };
    return (_jsxs(GuestLayout, { children: [_jsx(Head, { title: "Log in" }), status && (_jsx("div", { className: "mb-4 text-sm font-medium text-green-600", children: status })), _jsxs("form", { onSubmit: submit, style: { zIndex: 10 }, className: "z-50 bg-transparent p-8 rounded-3xl shadow-lg max-w-md w-full mx-auto", children: [_jsx("div", { className: "w-full h-2 bg-[#FF2C19] rounded-full mb-8" }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2 text-center", children: "Login" }), _jsx("p", { className: "text-gray-500 text-sm mb-8 text-center", children: "Please enter your details." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx(InputLabel, { htmlFor: "email", value: "Email", className: "text-red-600 text-base font-bold" }), _jsx(TextInput, { id: "email", type: "email", name: "email", value: data.email, className: "mt-1 block w-full border-0 border-b border-red-600 focus:border-red-500 focus:ring-0 bg-transparent px-0 text-gray-700 rounded-none hover:bg-slate-200 transition-colors", autoComplete: "username", isFocused: true, onChange: (e) => setData('email', e.target.value) })] }), _jsxs("div", { children: [_jsx(InputLabel, { htmlFor: "password", value: "Password", className: "text-red-600 text-base font-bold" }), _jsx(TextInput, { id: "password", type: "password", name: "password", value: data.password, className: "mt-1 block w-full border-0 border-b border-red-600 focus:border-red-500 focus:ring-0 bg-transparent px-0 text-gray-700 rounded-none hover:bg-slate-200 transition-colors", autoComplete: "current-password", onChange: (e) => setData('password', e.target.value) }), _jsx(InputError, { message: errors.password, className: "mt-2" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "flex items-center", children: [_jsx(Checkbox, { name: "remember", checked: data.remember, onChange: (e) => setData('remember', e.target.checked), className: "border-gray-300 text-[#FF2C19] focus:ring-[#FF2C19]" }), _jsx("span", { className: "ms-2 text-sm text-gray-600", children: "Remember me" })] }), canResetPassword && (_jsx(Link, { href: route('password.request'), className: "text-sm text-[#FF2C19] hover:text-[#e52913] transition-colors", children: "Forgot password?" }))] }), _jsx("div", { className: 'flex justify-center', children: _jsx(PrimaryButton, { className: " w-4/5 bg-red-600 text-white px-8 py-4 rounded-[50px] hover:bg-red-600 transition-colors mt-8 text-xl font-semibold text-center flex justify-center items-center", style: {
                                        boxShadow: '0px 8px 15px rgba(249, 115, 22, 0.35)',
                                        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))',
                                        zIndex: 10,
                                    }, disabled: processing, children: "Login" }) })] })] }), _jsx("div", { style: { zIndex: 100 }, children: _jsx(Footer, {}) })] }));
}
