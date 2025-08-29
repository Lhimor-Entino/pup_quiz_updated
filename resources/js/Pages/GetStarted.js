import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Footer from "@/CustomComponents/Footer";
import { Link } from "@inertiajs/react";
import { useState } from "react";
const GetStarted = (props) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [setupType, setSetupType] = useState(null);
    const stepTitles = [
        "Describe a setup that suits you",
        "What type of account would you like to create?",
    ];
    const stepOptions = [
        [
            {
                id: "class",
                label: "Class",
                icon: "/images/icons/icon1.png",
                color: "bg-blue-500",
            },
            {
                id: "event",
                label: "Event",
                icon: "/images/icons/icon2.png",
                color: "bg-emerald-500",
            },
        ],
        setupType === "class"
            ? [
                {
                    id: "teacher",
                    label: "Teacher",
                    icon: "/images/icons/icon3.png",
                    color: "bg-teal-500",
                    href: "/teacher",
                },
                {
                    id: "student",
                    label: "Student",
                    icon: "/images/icons/icon4.png",
                    color: "bg-red-400",
                    href: "/student",
                },
            ]
            : [
                {
                    id: "participant",
                    label: "Participant",
                    icon: "/images/icons/icon3.png",
                    color: "bg-purple-500",
                    href: "/participant",
                },
                {
                    id: "Organizer",
                    label: "Organizer",
                    icon: "/images/icons/icon4.png",
                    color: "bg-yellow-400",
                    href: "/organizer",
                },
            ],
    ];
    return (_jsx("div", { className: "min-h-screen py-12 px-4 bg-gray-100", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "w-full lg:mb-6 mt-4 lg:mt-6", children: _jsx("div", { className: "w-full h-2 rounded-full bg-gray-300", children: _jsx("div", { className: "h-full rounded-full", style: {
                                backgroundColor: "#FF2C19",
                                width: `${(currentStep / 1) * 100}%`,
                            } }) }) }), _jsxs("div", { className: "p-8 pt-4", children: [_jsx("h2", { className: "text-2xl font-bold mb-8 text-gray-800", children: stepTitles[currentStep] }), _jsx("div", { className: "grid grid-cols-1 gap-6", children: stepOptions[currentStep].map((option) => {
                                const content = (_jsxs("div", { className: "flex items-center gap-x-4 bg-white rounded-md hover:cursor-pointer", children: [_jsx("div", { className: `${option.color} p-6 rounded-lg text-white hover:opacity-90 transition-opacity flex flex-col items-center`, children: _jsx("img", { src: option.icon, width: 80 }) }), _jsx("span", { className: "text-xl font-semibold", children: option.label })] }));
                                if (currentStep === 0) {
                                    return (_jsx("div", { onClick: () => {
                                            setSetupType(option.id);
                                            setCurrentStep(1);
                                        }, children: content }, option.id));
                                }
                                // Type Guard: Check if href exists
                                if (option.href) {
                                    return (_jsx(Link, { href: option.href, children: content }, option.id));
                                }
                                return content; // Return without the Link if no href
                            }) })] }), _jsx("div", { className: "mt-8 flex justify-between", children: _jsx("button", { onClick: () => {
                            setCurrentStep(Math.max(0, currentStep - 1));
                        }, style: { zIndex: 100 }, className: `px-6 py-2 rounded-lg ${currentStep === 0
                            ? "invisible"
                            : "bg-gray-200 hover:bg-gray-300"}`, children: "Previous" }) }), _jsx("div", { className: "z-100", children: _jsx(Footer, {}) })] }) }));
};
export default GetStarted;
