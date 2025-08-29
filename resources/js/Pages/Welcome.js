import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
const quiz = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            router.visit('home');
        }, 10000); // 10 seconds = 10000 milliseconds
        return () => clearTimeout(timer); // Clear timeout if component unmounts
    }, []);
    return (_jsx("div", { className: "h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-400", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-[100px] font-bold relative inline-block text-red-600 drop-shadow-[4px_4px_0_#ffcc00] shadow-black shadow-lg", children: "logo" }), _jsx("br", {}), _jsx("h1", { className: "text-[100px] font-bold relative inline-block text-yellow-400 drop-shadow-[4px_4px_0_#e60000] shadow-black shadow-lg mb-8", children: "QUIZ" }), _jsx("div", { className: "flex justify-center items-center", children: _jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600" }) }), _jsx("p", { className: "text-red-600 mt-4 text-xl font-semibold animate-pulse", children: "Loading..." })] }) }));
};
export default quiz;
