import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

// Define interfaces for quiz data received from backend, matching snake_case
interface Option {
    id: number;
    option_text: string; // Matches database column
    is_correct: boolean; // Matches database column
}

interface Question {
    id: number;
    quiz_id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question_text: string; // Matches database column
    image_path: string | null; // Matches database column 'image_path'
    options: Option[];
    true_false_answer: boolean | null; // Matches database column
    short_answer: string | null;
    time_limit: number | null; // Matches database column
    points: number | null;
    difficulty: 'easy' | 'average' | 'hard';
}

interface Quiz {
    id: number;
    title: string;
    status: 'published' | 'draft' | 'archived';
    created_at: string;
    questions: Question[];
    user_id: number;
    updated_at: string;
    code: string | null;
}

interface ShowQuizPageProps {
    quiz: Quiz;
}

export default function ShowQuizPage({ quiz }: ShowQuizPageProps) {
    // Function to format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Quiz Details: {quiz.title}</h2>}
        >
            <Head title={`Quiz: ${quiz.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
                        <p className="text-gray-600 mb-2">Status: <span className={`font-semibold ${
                            quiz.status === 'published' ? 'text-green-600' :
                            quiz.status === 'draft' ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>{quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}</span></p>
                        {quiz.code && (
                            <p className="text-gray-600 mb-2">Quiz Code: <span className="font-semibold text-indigo-700">{quiz.code}</span></p>
                        )}
                        <p className="text-gray-600 mb-6">Created: {formatDate(quiz.created_at)}</p>

                        <div className="flex justify-end mb-6">
                            <Link
                                href={route('quizzes.edit', quiz.id)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150 mr-2"
                            >
                                Edit Quiz
                            </Link>
                            {quiz.status === 'published' && (
                                <Link
                                    href={route('quizzes.live_session', quiz.id)}
                                    className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 active:bg-purple-900 focus:outline-none focus:border-purple-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    View Live Session (Host)
                                </Link>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold text-gray-700 mb-4">Questions ({quiz.questions.length})</h3>

                        {quiz.questions.length === 0 ? (
                            <p className="text-gray-500">No questions found for this quiz.</p>
                        ) : (
                            <div className="space-y-8">
                                {quiz.questions.map((question, index) => (
                                    <div key={question.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-lg font-semibold text-gray-800 mb-2">
                                            {index + 1}. {question.question_text}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Type: <span className="font-medium">{question.type.charAt(0).toUpperCase() + question.type.slice(1)}</span> |
                                            Difficulty: <span className="font-medium">{question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}</span> |
                                            Points: <span className="font-medium">{question.points ?? 'N/A'}</span> |
                                            Time Limit: <span className="font-medium">{question.time_limit ? `${question.time_limit}s` : 'N/A'}</span>
                                        </p>

                                        {question.image_path && (
                                            <img
                                                src={`/storage/${question.image_path}`}
                                                alt="Question Image"
                                                className="my-4 max-h-60 object-contain mx-auto rounded-lg shadow-md"
                                            />
                                        )}

                                        {question.type === 'multiple-choice' && question.options && (
                                            <div className="mt-4 space-y-2">
                                                <p className="font-medium text-gray-700">Options:</p>
                                                {question.options.map((option) => (
                                                    <div key={option.id} className={`p-2 rounded-md border flex items-center ${
                                                        option.is_correct ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                                                    }`}>
                                                        {option.is_correct && <span className="text-green-600 mr-2">&#10003;</span>}
                                                        <span className="text-gray-800">{option.option_text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === 'true-false' && (
                                            <div className="mt-4">
                                                <p className="font-medium text-gray-700">Correct Answer:</p>
                                                <div className={`p-2 rounded-md border inline-block ${
                                                    question.true_false_answer === true ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                                                }`}>
                                                    <span className="text-gray-800">True</span>
                                                </div>
                                                <div className={`p-2 rounded-md border inline-block ml-2 ${
                                                    question.true_false_answer === false ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                                                }`}>
                                                    <span className="text-gray-800">False</span>
                                                </div>
                                                {question.true_false_answer !== null && (
                                                    <p className="mt-2 text-sm text-gray-700">The correct answer is: <span className="font-bold">{question.true_false_answer ? 'True' : 'False'}</span></p>
                                                )}
                                            </div>
                                        )}

                                        {question.type === 'short-answer' && (
                                            <div className="mt-4">
                                                <p className="font-medium text-gray-700">Correct Answer:</p>
                                                <div className="p-2 rounded-md border bg-green-100 border-green-500">
                                                    <span className="font-semibold text-gray-800">{question.short_answer ?? 'N/A'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
