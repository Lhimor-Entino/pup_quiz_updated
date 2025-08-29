import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Footer from "@/CustomComponents/Footer";
import { useState } from "react";
const Form = (props) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: "",
        department: "",
        username: "",
        email: "",
        password: "",
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const steps = [
        {
            fields: [
                { name: "fullName", label: "Full Name", type: "text" },
                { name: "department", label: "Department", type: "text" },
            ],
        },
        {
            fields: [
                { name: "username", label: "Username", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "password", label: "Password", type: "password" },
            ],
        },
    ];
    return (_jsxs("div", { className: "min-h-screen flex items-center justify-center ", children: [_jsxs("div", { className: "max-w-md w-full px-6 py-8", children: [_jsx("div", { className: "w-[100%] lg:w-[100%] mx-auto  lg:mb-6 mt-4 lg:mt-6", children: _jsx("div", { className: "w-full h-2 rounded-full bg-transparent", children: _jsx("div", { className: "h-full rounded-full", style: {
                                    backgroundColor: "#FF2C19",
                                    width: `${(currentStep / 2) * 100}%`,
                                } }) }) }), _jsxs("div", { className: "bg-transparent rounded-lg p-8 shadow-lg", children: [_jsx("h2", { className: "text-2xl font-bold text-center mb-2", children: "Create an account" }), _jsx("p", { className: "text-gray-600 text-center mb-8", children: "Please enter your details." }), _jsxs("form", { className: "space-y-6", style: { zIndex: 1000 }, children: [steps[currentStep].fields.map((field) => (_jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-red-500 text-lg mb-1", htmlFor: field.name, children: field.label }), _jsx("input", { type: field.type, id: field.name, name: field.name, value: formData[field.name], onChange: handleChange, className: "w-full border-0 border-b border-red-500 pb-2 text-lg focus:ring-0 focus:outline-none focus:border-b-2 bg-transparent", placeholder: " " })] }, field.name))), _jsxs("div", { className: "flex justify-between pt-8", children: [currentStep > 0 && (_jsx("button", { type: "button", onClick: () => setCurrentStep(currentStep - 1), style: { zIndex: 100 }, className: "text-gray-600 hover:text-gray-800", children: "Previous" })), _jsx("button", { type: "button", style: { zIndex: 100 }, onClick: () => {
                                                    if (currentStep < steps.length - 1) {
                                                        setCurrentStep(currentStep + 1);
                                                    }
                                                    else {
                                                        // Handle form submission
                                                        console.log("Form submitted:", formData);
                                                    }
                                                }, className: "ml-auto bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-colors", children: currentStep === steps.length - 1
                                                    ? "Sign Up"
                                                    : "Continue" })] })] })] })] }), _jsx(Footer, {})] }));
};
export default Form;
