import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useMemo } from 'react';
import { X, PlusCircle, Eye, Save, LogOut, Trash2, Copy, Clock, List, Star, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
export default function CreateQuizPage() {
    const [showModal, setShowModal] = useState(true);
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [previewContent, setPreviewContent] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRefs = useRef({});
    const handleBlankCanvasClick = () => {
        setShowModal(false);
    };
    const addQuestion = (type) => {
        setQuestions(prevQuestions => [
            ...prevQuestions,
            {
                id: Date.now(),
                type: type,
                questionText: '',
                image: null,
                options: type === 'multiple-choice' ? [{ id: 1, text: '', isCorrect: false }, { id: 2, text: '', isCorrect: false }, { id: 3, text: '', isCorrect: false }, { id: 4, text: '', isCorrect: false }] : [],
                trueFalseAnswer: null,
                shortAnswer: '',
                timeLimit: '',
                points: '',
                showDetails: true,
            }
        ]);
    };
    const handleQuestionChange = (id, field, value) => {
        setQuestions(prevQuestions => prevQuestions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };
    const handleOptionChange = (questionId, optionId, field, value) => {
        setQuestions(prevQuestions => prevQuestions.map(q => q.id === questionId
            ? {
                ...q,
                options: q.options.map(opt => opt.id === optionId ? { ...opt, [field]: value } : opt),
            }
            : q));
    };
    const handleCorrectAnswerChange = (questionId, optionId) => {
        setQuestions(prevQuestions => prevQuestions.map(q => q.id === questionId
            ? {
                ...q,
                options: q.options.map(opt => ({
                    ...opt,
                    isCorrect: opt.id === optionId,
                })),
            }
            : q));
    };
    const handleTrueFalseChange = (questionId, value) => {
        setQuestions(prevQuestions => prevQuestions.map(q => q.id === questionId ? { ...q, trueFalseAnswer: value } : q));
    };
    const handleImageUpload = (questionId, event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuestions(prevQuestions => prevQuestions.map(q => q.id === questionId ? { ...q, image: reader.result } : q));
            };
            reader.readAsDataURL(file);
        }
    };
    const toggleQuestionDetails = (id) => {
        setQuestions(prevQuestions => prevQuestions.map(q => q.id === id ? { ...q, showDetails: !q.showDetails } : q));
    };
    const updatePreview = () => {
        const newPreviewContent = questions.map((q, index) => (_jsxs("div", { className: "mb-2 p-2 border rounded-md bg-gray-50", children: [_jsxs("p", { className: "font-semibold", children: ["Question ", index + 1, ": ", q.questionText || `Untitled ${q.type}`] }), q.type === 'multiple-choice' && (_jsx("ul", { className: "list-disc ml-5 text-sm", children: q.options.map(opt => (_jsxs("li", { className: opt.isCorrect ? 'text-green-600 font-medium' : '', children: [opt.text || 'Option', " ", opt.isCorrect && '(Correct)'] }, opt.id))) })), q.type === 'true-false' && (_jsxs("p", { className: "text-sm", children: ["Correct Answer: ", q.trueFalseAnswer !== null ? (q.trueFalseAnswer ? 'True' : 'False') : 'Not set'] })), q.type === 'short-answer' && (_jsxs("p", { className: "text-sm", children: ["Correct Answer: ", q.shortAnswer || 'Not set'] })), q.timeLimit && _jsxs("p", { className: "text-sm", children: ["Time Limit: ", q.timeLimit, " seconds"] }), q.points && _jsxs("p", { className: "text-sm", children: ["Points: ", q.points] }), q.image && _jsx("img", { src: q.image, alt: "Question", className: "mt-2 h-20 w-auto object-cover rounded" })] }, q.id)));
        setPreviewContent(newPreviewContent);
        setShowPreview(true);
    };
    const totalPoints = useMemo(() => {
        return questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);
    }, [questions]);
    const totalTimeLimit = useMemo(() => {
        return questions.reduce((sum, q) => sum + (parseInt(q.timeLimit) || 0), 0);
    }, [questions]);
    const totalQuestionsCount = questions.length;
    const handleSave = () => {
        // Prepare data to send to backend, using camelCase for frontend consistency
        // Laravel's Request object will automatically convert camelCase to snake_case for top-level keys
        // and for nested JSON if configured, but explicit mapping is safer for nested objects.
        const quizData = {
            title: quizTitle,
            questions: questions.map(q => ({
                type: q.type,
                questionText: q.questionText, // Will be mapped to 'question_text' in controller
                image: q.image, // Will be mapped to 'image_path' in controller
                timeLimit: q.timeLimit ? parseInt(q.timeLimit) : null, // Will be mapped to 'time_limit'
                points: q.points ? parseInt(q.points) : null,
                options: q.type === 'multiple-choice' ? q.options.map(opt => ({
                    text: opt.text, // Will be mapped to 'option_text'
                    isCorrect: opt.isCorrect, // Will be mapped to 'is_correct'
                })) : null,
                trueFalseAnswer: q.type === 'true-false' ? (q.trueFalseAnswer === true || q.trueFalseAnswer === false ? q.trueFalseAnswer : null) : null, // Will be mapped to 'true_false_answer'
                shortAnswer: q.type === 'short-answer' ? (q.shortAnswer || null) : null, // Will be mapped to 'short_answer'
            }))
        };
        router.post('/quizzes', quizData, {
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Quiz created successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                setQuizTitle('');
                setQuestions([]);
                setPreviewContent([]);
                setShowPreview(false);
            },
            onError: (errors) => {
                console.error('Error saving quiz:', errors);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error saving quiz. Please check your inputs.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
        });
    };
    const handleExit = () => {
        setShowModal(true);
        setQuestions([]);
        setQuizTitle('');
        setPreviewContent([]);
        setShowPreview(false);
    };
    const handleDelete = (id) => {
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
    };
    const handleDuplicate = (id) => {
        const questionToDuplicate = questions.find(q => q.id === id);
        if (questionToDuplicate) {
            const duplicatedQuestion = { ...questionToDuplicate, id: Date.now(), questionText: `${questionToDuplicate.questionText} (Copy)`, showDetails: true };
            setQuestions(prevQuestions => [...prevQuestions, duplicatedQuestion]);
        }
    };
    return (_jsxs(AuthenticatedLayout, { children: [_jsx(Head, { title: "Create Quiz" }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", onClick: () => setShowModal(false), children: _jsxs("div", { className: "bg-white p-6 rounded-lg w-full max-w-4xl relative shadow-2xl", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setShowModal(false), className: "absolute top-3 right-3 text-gray-500 hover:text-gray-700", children: _jsx(X, { size: 24 }) }), _jsx("h2", { className: "text-2xl font-bold mb-4", children: "Create a new quiz" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "border rounded-lg p-4 shadow-md text-center cursor-not-allowed opacity-60", children: [_jsx("img", { src: "https://placehold.co/96x96/e0e0e0/333333?text=PDF", alt: "PDF to Quiz", className: "mx-auto mb-2 w-24 h-24 object-contain" }), _jsx("h3", { className: "font-semibold", children: "PDF to Quiz" }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Generate or extract questions from your PDF" }), _jsx("button", { className: "border border-red-500 text-red-500 px-3 py-1 rounded cursor-not-allowed", children: "AI Assisted" })] }), _jsxs("div", { className: "border rounded-lg p-4 shadow-md text-center cursor-not-allowed opacity-60", children: [_jsx("img", { src: "https://placehold.co/96x96/e0e0e0/333333?text=Notes", alt: "Notes to Quiz", className: "mx-auto mb-2 w-24 h-24 object-contain" }), _jsx("h3", { className: "font-semibold", children: "Notes to Quiz" }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Generate extract questions from your Notes" }), _jsx("button", { className: "border border-red-500 text-red-500 px-3 py-1 rounded cursor-not-allowed", children: "AI Assisted" })] }), _jsxs("div", { className: "border rounded-lg p-4 shadow-md text-center flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors", onClick: handleBlankCanvasClick, children: [_jsx(PlusCircle, { size: 48, className: "text-gray-500 mb-2" }), _jsx("h3", { className: "font-semibold", children: "Blank Canvas" }), _jsx("p", { className: "text-sm text-gray-600", children: "Create a quiz from scratch" })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { onClick: () => setShowModal(false), className: "bg-gray-200 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-300 transition-colors", children: "Close" }) })] }) })), _jsxs("div", { className: "py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "quiz-title", className: "block text-sm font-medium text-gray-700 mb-1", children: "Quiz Title" }), _jsx("input", { id: "quiz-title", type: "text", placeholder: "Enter Quiz Title", className: "w-full border p-3 mb-4 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500", value: quizTitle, onChange: (e) => setQuizTitle(e.target.value) }), _jsx("div", { className: "space-y-4", children: questions.map((q) => (_jsxs("div", { className: "border rounded-lg p-4 shadow-md bg-white", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("h4", { className: "font-semibold text-lg cursor-pointer", onClick: () => toggleQuestionDetails(q.id), children: ["Question: ", q.questionText || `Untitled ${q.type}`] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleDelete(q.id), className: "text-red-500 hover:text-red-700", children: _jsx(Trash2, { size: 20 }) }), _jsx("button", { onClick: () => handleDuplicate(q.id), className: "text-gray-500 hover:text-gray-700", children: _jsx(Copy, { size: 20 }) })] })] }), q.showDetails && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: `question-text-${q.id}`, className: "block text-sm font-medium text-gray-700 mb-1", children: "Question Text" }), _jsx("input", { id: `question-text-${q.id}`, type: "text", placeholder: "Enter question text", className: "w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500", value: q.questionText, onChange: (e) => handleQuestionChange(q.id, 'questionText', e.target.value) })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Question Type" }), _jsxs("select", { className: "w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500", value: q.type, onChange: (e) => handleQuestionChange(q.id, 'type', e.target.value), children: [_jsx("option", { value: "multiple-choice", children: "Multiple Choice" }), _jsx("option", { value: "true-false", children: "True/False" }), _jsx("option", { value: "short-answer", children: "Short Answer" })] })] }), q.type === 'multiple-choice' && (_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Answer Options (Select correct one)" }), q.options.map((opt, index) => (_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { type: "radio", name: `correct-answer-${q.id}`, checked: opt.isCorrect, onChange: () => handleCorrectAnswerChange(q.id, opt.id), className: "form-radio text-red-600" }), _jsx("input", { type: "text", placeholder: `Option ${index + 1}`, className: "flex-grow border p-2 rounded-md focus:ring-red-500 focus:border-red-500", value: opt.text, onChange: (e) => handleOptionChange(q.id, opt.id, 'text', e.target.value) })] }, opt.id)))] })), q.type === 'true-false' && (_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Correct Answer" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("label", { className: "inline-flex items-center", children: [_jsx("input", { type: "radio", name: `true-false-${q.id}`, value: "true", checked: q.trueFalseAnswer === true, onChange: () => handleTrueFalseChange(q.id, true), className: "form-radio text-red-600" }), _jsx("span", { className: "ml-2", children: "True" })] }), _jsxs("label", { className: "inline-flex items-center", children: [_jsx("input", { type: "radio", name: `true-false-${q.id}`, value: "false", checked: q.trueFalseAnswer === false, onChange: () => handleTrueFalseChange(q.id, false), className: "form-radio text-red-600" }), _jsx("span", { className: "ml-2", children: "False" })] })] })] })), q.type === 'short-answer' && (_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: `short-answer-${q.id}`, className: "block text-sm font-medium text-gray-700 mb-1", children: "Correct Answer" }), _jsx("input", { id: `short-answer-${q.id}`, type: "text", placeholder: "Enter short answer", className: "w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500", value: q.shortAnswer, onChange: (e) => handleQuestionChange(q.id, 'shortAnswer', e.target.value) })] })), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: `time-limit-${q.id}`, className: "block text-sm font-medium text-gray-700 mb-1", children: "Time Limit (seconds)" }), _jsx("input", { id: `time-limit-${q.id}`, type: "number", placeholder: "e.g., 30", className: "w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500", value: q.timeLimit, onChange: (e) => handleQuestionChange(q.id, 'timeLimit', e.target.value) })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: `points-${q.id}`, className: "block text-sm font-medium text-gray-700 mb-1", children: "Points" }), _jsx("input", { id: `points-${q.id}`, type: "number", placeholder: "e.g., 10", className: "w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500", value: q.points, onChange: (e) => handleQuestionChange(q.id, 'points', e.target.value) })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: `image-upload-${q.id}`, className: "block text-sm font-medium text-gray-700 mb-1", children: "Image (Optional)" }), _jsx("input", { id: `image-upload-${q.id}`, type: "file", accept: "image/*", className: "hidden", ref: el => fileInputRefs.current[q.id] = el, onChange: (e) => handleImageUpload(q.id, e) }), _jsxs("button", { type: "button", onClick: () => fileInputRefs.current[q.id]?.click(), className: "bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-300 transition-colors", children: [_jsx(ImageIcon, { size: 18 }), " Upload Image"] }), q.image && (_jsxs("div", { className: "mt-2 relative", children: [_jsx("img", { src: q.image, alt: "Question Preview", className: "h-24 w-auto object-cover rounded-md" }), _jsx("button", { onClick: () => handleQuestionChange(q.id, 'image', null), className: "absolute top-0 right-0 bg-red-500 text-white rounded-full p-1", "aria-label": "Remove image", children: _jsx(X, { size: 16 }) })] }))] })] }))] }, q.id))) }), _jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [_jsxs("button", { onClick: () => addQuestion('multiple-choice'), className: "bg-red-600 text-white rounded-full px-6 py-2 shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2", children: [_jsx(PlusCircle, { size: 20 }), " Add Multiple Choice"] }), _jsxs("button", { onClick: () => addQuestion('true-false'), className: "bg-red-600 text-white rounded-full px-6 py-2 shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2", children: [_jsx(PlusCircle, { size: 20 }), " Add True/False"] }), _jsxs("button", { onClick: () => addQuestion('short-answer'), className: "bg-red-600 text-white rounded-full px-6 py-2 shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2", children: [_jsx(PlusCircle, { size: 20 }), " Add Short Answer"] })] })] }), _jsx("div", { className: "space-y-4 relative", children: _jsxs("div", { className: "p-4 bg-white rounded-lg shadow-md h-full min-h-[200px]", children: [_jsx("h4", { className: "font-bold text-xl mb-3 text-gray-800", children: "Quiz Preview" }), showPreview ? (previewContent.length > 0 ? (_jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-lg mb-2", children: quizTitle || "Untitled Quiz" }), previewContent] })) : (_jsx("p", { className: "text-gray-500", children: "No questions to preview yet. Add some questions!" }))) : (_jsx("p", { className: "text-gray-500", children: "Click 'Preview' button to see your quiz layout." }))] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: updatePreview, className: "flex items-center justify-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md w-full hover:bg-gray-300 transition-colors font-semibold", children: [_jsx(Eye, { size: 18, className: "mr-2" }), " Preview"] }), _jsxs("div", { className: "flex gap-2 w-full", children: [_jsxs("button", { onClick: handleSave, className: "bg-red-600 text-white px-4 py-2 rounded-lg shadow-md flex-1 flex items-center justify-center hover:bg-red-700 transition-colors font-semibold", children: [_jsx(Save, { size: 18, className: "mr-2" }), " Save"] }), _jsxs("button", { onClick: handleExit, className: "bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md flex-1 flex items-center justify-center hover:bg-gray-300 transition-colors font-semibold", children: [_jsx(LogOut, { size: 18, className: "mr-2" }), " Exit"] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-lg font-bold mb-3 text-gray-800", children: "Quiz Summary" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-gray-700", children: [_jsx(List, { size: 18, className: "text-red-500" }), " ", _jsx("span", { className: "font-medium", children: "Total Questions:" }), _jsx("span", { children: totalQuestionsCount })] }), _jsxs("div", { className: "flex items-center gap-2 text-gray-700", children: [_jsx(Clock, { size: 18, className: "text-blue-500" }), " ", _jsx("span", { className: "font-medium", children: "Total Time Limit:" }), _jsxs("span", { children: [totalTimeLimit, " seconds"] })] }), _jsxs("div", { className: "flex items-center gap-2 text-gray-700", children: [_jsx(Star, { size: 18, className: "text-yellow-500" }), " ", _jsx("span", { className: "font-medium", children: "Total Points:" }), _jsx("span", { children: totalPoints })] })] })] })] })] })] }));
}
