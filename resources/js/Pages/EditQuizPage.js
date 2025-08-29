import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PlusCircle, Save } from 'lucide-react'; // Example icons
export default function EditQuizPage({ quiz, status, error }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: quiz.title,
        questions: quiz.questions.map(q => ({
            id: q.id, // Keep existing ID for updates
            type: q.type,
            questionText: q.question_text, // Frontend uses questionText, backend uses question_text
            timeLimit: q.time_limit,
            points: q.points,
            image: q.image_path, // Assuming you handle base64 image data for re-uploads
            options: q.options?.map(opt => ({
                id: opt.id, // Keep existing ID for options
                text: opt.option_text,
                isCorrect: opt.is_correct,
            })) || [], // Ensure it's an array even if empty
            trueFalseAnswer: q.true_false_answer,
            shortAnswer: q.short_answer,
        })),
        // Add any other top-level quiz properties you want to edit
    });
    // Transform data before sending to backend (e.g., matching backend column names)
    transform((data) => ({
        ...data,
        questions: data.questions.map((q) => ({
            ...q,
            question_text: q.questionText,
            options: q.options?.map(opt => ({
                ...opt,
                option_text: opt.text,
                is_correct: opt.isCorrect,
            }))
        })),
    }));
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/quizzes/${quiz.id}`, {
            onSuccess: () => {
                alert('Quiz updated successfully!'); // Replace with Swal or a notification
            },
            onError: (formErrors) => {
                console.error('Form submission errors:', formErrors);
                // Errors object from useForm will automatically show errors below inputs
            },
        });
    };
    const handleTitleChange = (e) => {
        setData('title', e.target.value);
    };
    // Placeholder for adding a new question
    const addQuestion = () => {
        setData('questions', [...data.questions, {
                type: 'multiple-choice',
                questionText: '',
                options: [{ text: '', isCorrect: false }],
            }]);
    };
    return (_jsxs(AuthenticatedLayout, { header: _jsxs("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: ["Edit Quiz: ", quiz.title] }), children: [_jsx(Head, { title: `Edit Quiz: ${quiz.title}` }), _jsx("div", { className: "py-12", children: _jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8", children: _jsxs("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg p-6", children: [status && _jsx("div", { className: "mb-4 font-medium text-sm text-green-600", children: status }), error && _jsx("div", { className: "mb-4 font-medium text-sm text-red-600", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700", children: "Quiz Title" }), _jsx("input", { type: "text", id: "title", name: "title", value: data.title, onChange: handleTitleChange, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50", required: true }), errors.title && _jsx("div", { className: "text-red-500 text-sm mt-1", children: errors.title })] }), _jsx("h3", { className: "text-xl font-bold mb-3", children: "Questions" }), data.questions.length === 0 && _jsx("p", { className: "mb-4", children: "No questions yet. Add one!" }), data.questions.map((question, qIndex) => (_jsxs("div", { className: "bg-gray-50 p-4 rounded-md mb-4 border border-gray-200", children: [_jsxs("h4", { className: "font-semibold mb-2", children: ["Question ", qIndex + 1] }), _jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Question Text" }), _jsx("input", { type: "text", value: question.questionText, onChange: (e) => {
                                                            const newQuestions = [...data.questions];
                                                            newQuestions[qIndex].questionText = e.target.value;
                                                            setData('questions', newQuestions);
                                                        }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm" }), errors[`questions.${qIndex}.questionText`] && _jsx("div", { className: "text-red-500 text-sm mt-1", children: errors[`questions.${qIndex}.questionText`] })] }), question.type === 'multiple-choice' && question.options && (_jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Options" }), question.options.map((option, oIndex) => (_jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx("input", { type: "text", value: option.text, onChange: (e) => {
                                                                    const newQuestions = [...data.questions];
                                                                    if (newQuestions[qIndex].options) {
                                                                        newQuestions[qIndex].options[oIndex].text = e.target.value;
                                                                        setData('questions', newQuestions);
                                                                    }
                                                                }, className: "block w-full rounded-md border-gray-300 shadow-sm text-sm" }), _jsx("input", { type: "checkbox", checked: option.isCorrect, onChange: (e) => {
                                                                    const newQuestions = [...data.questions];
                                                                    if (newQuestions[qIndex].options) {
                                                                        newQuestions[qIndex].options[oIndex].isCorrect = e.target.checked;
                                                                        setData('questions', newQuestions);
                                                                    }
                                                                }, className: "rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Correct" })] }, option.id || oIndex)))] })), question.type === 'true-false' && (_jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Correct Answer" }), _jsxs("select", { value: String(question.trueFalseAnswer), onChange: (e) => {
                                                            const newQuestions = [...data.questions];
                                                            newQuestions[qIndex].trueFalseAnswer = e.target.value === 'true';
                                                            setData('questions', newQuestions);
                                                        }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm", children: [_jsx("option", { value: "true", children: "True" }), _jsx("option", { value: "false", children: "False" })] })] })), question.type === 'short-answer' && (_jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Correct Answer" }), _jsx("input", { type: "text", value: question.shortAnswer || '', onChange: (e) => {
                                                            const newQuestions = [...data.questions];
                                                            newQuestions[qIndex].shortAnswer = e.target.value;
                                                            setData('questions', newQuestions);
                                                        }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm" })] }))] }, question.id || qIndex))), _jsxs("button", { type: "button", onClick: addQuestion, className: "inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 mb-6", children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add Question"] }), _jsx("div", { className: "flex items-center justify-end", children: _jsxs("button", { type: "submit", className: "inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150", disabled: processing, children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), " ", processing ? 'Updating...' : 'Update Quiz'] }) })] })] }) }) })] }));
}
