import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Footer from "@/CustomComponents/Footer";
import { useState } from "react";
const JoinPage = (props) => {
    const [message, setMessage] = useState("");
    const handleJoin = () => {
        console.log("Message:", message);
        // Add logic here if needed
    };
    return (_jsxs("div", { className: "min-h-screen w-full bg-cover bg-center flex items-start justify-center relative" // changed to items-start to align content to the top
        , style: {
            backgroundImage: "url('/images/bgonly.png')", // Normal background image without shadow
        }, children: [_jsxs("div", { className: "relative z-10 w-full max-w-md px-6 text-center pt-0 flex flex-col justify-start", children: [" ", _jsx("img", { src: "/images/carousel/logooo.png" // Updated logo image
                        , alt: "Logo", className: "mb-8" // Adjust margin to move it closer to the top
                     }), _jsx("textarea", { className: "w-full p-3 rounded-md text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-6", rows: 2, placeholder: "Enter a join code" // Updated placeholder
                        , value: message, onChange: (e) => setMessage(e.target.value) }), _jsx("button", { onClick: handleJoin, className: "w-3/4 py-4 text-2xl bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all mx-auto", children: "Join" })] }), _jsx(Footer, {}), _jsx("div", { className: "absolute bottom-0 left-0 right-0", children: _jsx("img", { src: "/images/icons/footer.png" // Updated footer image
                    , alt: "Footer", className: "w-full" // Ensure it's responsive and spans the full width
                 }) })] }));
};
export default JoinPage;
