import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// resources/js/Pages/StartQuiz.tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react'; // No need for usePage if we're not getting auth.user yet
import { useState, useEffect } from 'react';
export default function StartQuiz({ quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // Stores user's selected answers (even if not submitted yet)
    const [quizStarted, setQuizStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    // Removed quizEnded and score as they're for submission/results
    const currentQuestion = quiz.questions[currentQuestionIndex];
    // Initialize timer for the current question
    useEffect(() => {
        if (quizStarted && currentQuestion && currentQuestion.time_limit !== null) {
            setTimeLeft(currentQuestion.time_limit);
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime === null)
                        return null;
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleNextQuestion(); // Move to next question if time runs out
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer); // Cleanup on unmount or question change
        }
        else {
            setTimeLeft(null); // No timer if no time_limit or quiz not started
        }
    }, [currentQuestionIndex, quizStarted, quiz.questions.length, currentQuestion?.time_limit]); // Added currentQuestion.time_limit as dependency for re-init on question change
    // Handler for answer changes
    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };
    // Handler for moving to the next question or indicating quiz finished
    const handleNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < quiz.questions.length) {
            setCurrentQuestionIndex(nextIndex);
        }
        else {
            // All questions displayed. For now, just go to dashboard or show a "Quiz Done" message.
            alert('You have completed the quiz! (No submission yet)'); // Simple alert
            router.visit(route('dashboard')); // Redirect to dashboard
        }
    };
    // --- Conditional Renderings ---
    if (!quizStarted) {
        return (_jsxs(AuthenticatedLayout, { header: _jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: quiz.title }), children: [_jsx(Head, { title: quiz.title }), _jsx("div", { className: "py-12", children: _jsxs("div", { className: "max-w-xl mx-auto sm:px-6 lg:px-8 bg-white p-6 rounded-lg shadow-md text-center", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: quiz.title }), _jsx("p", { className: "text-gray-700 mb-6", children: "You're about to start this quiz. Good luck!" }), _jsx("button", { onClick: () => setQuizStarted(true), className: "inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-lg text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150", children: "Start Quiz" })] }) })] }));
    }
    // Render the current question once quiz has started
    return (_jsxs(AuthenticatedLayout, { header: _jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: quiz.title }), children: [_jsx(Head, { title: quiz.title }), _jsx("div", { className: "py-12", children: _jsx("div", { className: "max-w-3xl mx-auto sm:px-6 lg:px-8", children: _jsxs("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg p-6", children: [_jsxs("h2", { className: "text-2xl font-bold mb-4", children: ["Question ", currentQuestionIndex + 1, " / ", quiz.questions.length, timeLeft !== null && (_jsxs("span", { className: "ml-4 text-xl text-red-500", children: ["Time Left: ", timeLeft, "s"] }))] }), _jsx("p", { className: "text-lg mb-4", children: currentQuestion?.question_text }), currentQuestion?.image_path && (_jsx("img", { src: `/storage/${currentQuestion.image_path}`, alt: "Question Image", className: "mb-4 max-h-64 object-contain mx-auto" })), currentQuestion?.type === 'multiple-choice' && (_jsx("div", { className: "space-y-3", children: currentQuestion.options?.map((option) => (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: `option-${option.id}`, name: `question-${currentQuestion.id}`, value: option.id, checked: userAnswers[currentQuestion.id] === option.id, onChange: () => handleAnswerChange(currentQuestion.id, option.id), className: "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" }), _jsx("label", { htmlFor: `option-${option.id}`, className: "ml-3 block text-base font-medium text-gray-700", children: option.option_text })] }, option.id))) })), currentQuestion?.type === 'true-false' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: `true-option`, name: `question-${currentQuestion.id}`, value: "true", checked: userAnswers[currentQuestion.id] === 'true', onChange: () => handleAnswerChange(currentQuestion.id, 'true'), className: "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" }), _jsx("label", { htmlFor: `true-option`, className: "ml-3 block text-base font-medium text-gray-700", children: "True" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", id: `false-option`, name: `question-${currentQuestion.id}`, value: "false", checked: userAnswers[currentQuestion.id] === 'false', onChange: () => handleAnswerChange(currentQuestion.id, 'false'), className: "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" }), _jsx("label", { htmlFor: `false-option`, className: "ml-3 block text-base font-medium text-gray-700", children: "False" })] })] })), currentQuestion?.type === 'short-answer' && (_jsx("div", { className: "mt-4", children: _jsx("input", { type: "text", placeholder: "Type your answer here...", value: userAnswers[currentQuestion.id] || '', onChange: (e) => handleAnswerChange(currentQuestion.id, e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" }) })), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { onClick: handleNextQuestion, className: "inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150", children: currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz (No Submission)' : 'Next Question' }) })] }) }) })] }));
}
