// resources/js/Pages/StartQuiz.tsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react'; // No need for usePage if we're not getting auth.user yet
import React, { useState, useEffect } from 'react';
// No Swal needed for now, as we're not submitting

// --- Interfaces for your data (ensure these match your backend models) ---
interface Option {
    id: number;
    option_text: string;
    is_correct: boolean; // You might not need this on the frontend for the actual quiz taking, but it's good to have it
}

interface Question {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question_text: string;
    image_path?: string; // Nullable
    time_limit?: number; // Nullable
    points?: number;     // Nullable
    difficulty: 'easy' | 'average' | 'hard'; // NEW: Added difficulty property
    options?: Option[];  // Only for multiple-choice
    true_false_answer?: boolean; // Only for true-false
    short_answer?: string; // Only for short-answer
}

interface Quiz {
    id: number;
    title: string;
    code: string;
    questions: Question[]; // The questions to be displayed
}

interface StartQuizProps {
    quiz: Quiz;
    // No other props needed for now
}


export default function StartQuiz({ quiz }: StartQuizProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: any }>({}); // Stores user's selected answers (even if not submitted yet)
    const [quizStarted, setQuizStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    // Removed quizEnded and score as they're for submission/results

    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Initialize timer for the current question
    useEffect(() => {
        if (quizStarted && currentQuestion && currentQuestion.time_limit !== null) {
            setTimeLeft(currentQuestion.time_limit);
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime === null) return null;
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleNextQuestion(); // Move to next question if time runs out
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer); // Cleanup on unmount or question change
        } else {
            setTimeLeft(null); // No timer if no time_limit or quiz not started
        }
    }, [currentQuestionIndex, quizStarted, quiz.questions.length, currentQuestion?.time_limit]); // Added currentQuestion.time_limit as dependency for re-init on question change

    // Handler for answer changes
    const handleAnswerChange = (questionId: number, answer: any) => {
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
        } else {
            // All questions displayed. For now, just go to dashboard or show a "Quiz Done" message.
            alert('You have completed the quiz! (No submission yet)'); // Simple alert
            router.visit(route('dashboard')); // Redirect to dashboard
        }
    };

    // --- Conditional Renderings ---
    if (!quizStarted) {
        return (
            <AuthenticatedLayout
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{quiz.title}</h2>}
            >
                <Head title={quiz.title} />
                <div className="py-12">
                    <div className="max-w-xl mx-auto sm:px-6 lg:px-8 bg-white p-6 rounded-lg shadow-md text-center">
                        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
                        <p className="text-gray-700 mb-6">You're about to start this quiz. Good luck!</p>
                        <button
                            onClick={() => setQuizStarted(true)}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-lg text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Start Quiz
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Render the current question once quiz has started
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{quiz.title}</h2>}
        >
            <Head title={quiz.title} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            Question {currentQuestionIndex + 1} / {quiz.questions.length}
                            {timeLeft !== null && (
                                <span className="ml-4 text-xl text-red-500">
                                    Time Left: {timeLeft}s
                                </span>
                            )}
                        </h2>
                        {/* NEW: Display Difficulty */}
                        {currentQuestion?.difficulty && (
                            <p className="text-md text-gray-600 mb-4">
                                Difficulty: <span className={`font-semibold ${
                                    currentQuestion.difficulty === 'easy' ? 'text-green-600' :
                                    currentQuestion.difficulty === 'average' ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                                </span>
                            </p>
                        )}

                        <p className="text-lg mb-4">{currentQuestion?.question_text}</p>

                        {currentQuestion?.image_path && (
                            <img
                                src={`/storage/${currentQuestion.image_path}`}
                                alt="Question Image"
                                className="mb-4 max-h-64 object-contain mx-auto"
                            />
                        )}

                        {/* Render options based on question type */}
                        {currentQuestion?.type === 'multiple-choice' && (
                            <div className="space-y-3">
                                {currentQuestion.options?.map((option) => (
                                    <div key={option.id} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`option-${option.id}`}
                                            name={`question-${currentQuestion.id}`}
                                            value={option.id} // Store the ID of the selected option
                                            checked={userAnswers[currentQuestion.id] === option.id}
                                            onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label htmlFor={`option-${option.id}`} className="ml-3 block text-base font-medium text-gray-700">
                                            {option.option_text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentQuestion?.type === 'true-false' && (
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`true-option`}
                                        name={`question-${currentQuestion.id}`}
                                        value="true"
                                        checked={userAnswers[currentQuestion.id] === 'true'}
                                        onChange={() => handleAnswerChange(currentQuestion.id, 'true')}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                    <label htmlFor={`true-option`} className="ml-3 block text-base font-medium text-gray-700">
                                        True
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`false-option`}
                                        name={`question-${currentQuestion.id}`}
                                        value="false"
                                        checked={userAnswers[currentQuestion.id] === 'false'}
                                        onChange={() => handleAnswerChange(currentQuestion.id, 'false')}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                    <label htmlFor={`false-option`} className="ml-3 block text-base font-medium text-gray-700">
                                        False
                                    </label>
                                </div>
                            </div>
                        )}

                        {currentQuestion?.type === 'short-answer' && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    placeholder="Type your answer here..."
                                    value={userAnswers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleNextQuestion}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz (No Submission)' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
