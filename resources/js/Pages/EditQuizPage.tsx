import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, ChangeEvent } from 'react'; // Added ChangeEvent for input types
import { PlusCircle, Save } from 'lucide-react'; // Example icons

// --- Interfaces for your data (ensure these match your backend models) ---
interface Option {
    id?: number; // Optional because it might not exist for new options
    option_text: string;
    is_correct: boolean;
}

interface Question {
    id?: number; // Optional because it might not exist for new questions
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
    user_id: number;
    title: string;
    code: string; // Quiz code
    created_at: string;
    updated_at: string;
    questions: Question[]; // Eager loaded from your controller
}

interface EditQuizPageProps {
    quiz: Quiz;
    status?: string;
    error?: string;
}

export default function EditQuizPage({ quiz, status, error }: EditQuizPageProps) {

    const { data, setData, post, processing, errors, transform } = useForm({
        title: quiz.title,
        questions: quiz.questions.map(q => ({
            id: q.id, // Keep existing ID for updates
            type: q.type,
            questionText: q.question_text, // Frontend uses questionText, backend uses question_text
            timeLimit: q.time_limit,
            points: q.points,
            difficulty: q.difficulty, // NEW: Initialize difficulty from existing quiz data
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
            // image_path handled separately for base64 vs existing path
            // time_limit and points are already numbers/null
            options: q.options?.map(opt => ({
                ...opt,
                option_text: opt.text,
                is_correct: opt.isCorrect,
            })),
            // true_false_answer and short_answer are already correct
            // difficulty is already correct
        })),
    }));

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Use Inertia's post method with the PUT method spoofing for updates
        post(`/quizzes/${quiz.id}`, {
            onSuccess: () => {
                // Using alert for now, consider Swal as in CreateQuizPage
                alert('Quiz updated successfully!');
            },
            onError: (formErrors) => {
                console.error('Form submission errors:', formErrors);
                // Errors object from useForm will automatically show errors below inputs
            },
            // Explicitly specify PUT method for update action
            method: 'put', // Use 'put' for update actions
        });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('title', e.target.value);
    };

    // Handler for general question property changes
    const handleQuestionChange = (qIndex: number, field: keyof Question, value: any) => {
        const newQuestions = [...data.questions];
        // Type assertion to ensure correct field access
        (newQuestions[qIndex] as any)[field] = value;
        setData('questions', newQuestions);
    };

    // Handler for option text changes
    const handleOptionTextChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...data.questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options![oIndex].text = value;
            setData('questions', newQuestions);
        }
    };

    // Handler for option isCorrect changes
    const handleOptionIsCorrectChange = (qIndex: number, oIndex: number, checked: boolean) => {
        const newQuestions = [...data.questions];
        if (newQuestions[qIndex].options) {
            // Ensure only one option is correct for multiple-choice
            newQuestions[qIndex].options = newQuestions[qIndex].options!.map((opt, idx) => ({
                ...opt,
                isCorrect: idx === oIndex ? checked : false,
            }));
            setData('questions', newQuestions);
        }
    };

    // Handler for adding a new option
    const addOption = (qIndex: number) => {
        const newQuestions = [...data.questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options!.push({ text: '', isCorrect: false });
            setData('questions', newQuestions);
        }
    };

    // Handler for removing an option
    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...data.questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options!.splice(oIndex, 1);
            setData('questions', newQuestions);
        }
    };

    // Placeholder for adding a new question
    const addQuestion = () => {
        setData('questions', [...data.questions, {
            type: 'multiple-choice',
            questionText: '',
            timeLimit: null,
            points: null,
            difficulty: 'easy', // NEW: Default difficulty for new questions
            image_path: undefined, // ensure it's undefined initially, not null
            options: [{ id: Date.now(), option_text: '', is_correct: false }], // Default new option for multiple-choice
            true_false_answer: null,
            short_answer: '',
        } as Question]); // Type assertion for initial new question structure
    };

    const removeQuestion = (qIndex: number) => {
        const newQuestions = [...data.questions];
        newQuestions.splice(qIndex, 1);
        setData('questions', newQuestions);
    };


    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Quiz: {quiz.title}</h2>}
        >
            <Head title={`Edit Quiz: ${quiz.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
                        {error && <div className="mb-4 font-medium text-sm text-red-600">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Quiz Title */}
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Quiz Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={data.title}
                                    onChange={handleTitleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            {/* Questions Section */}
                            <h3 className="text-xl font-bold mb-3">Questions</h3>
                            {data.questions.length === 0 && <p className="mb-4">No questions yet. Add one!</p>}

                            {data.questions.map((question, qIndex) => (
                                <div key={question.id || qIndex} className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold">Question {qIndex + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove Question
                                        </button>
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Question Text</label>
                                        <input
                                            type="text"
                                            value={question.questionText}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                        {errors[`questions.${qIndex}.questionText`] && <div className="text-red-500 text-sm mt-1">{errors[`questions.${qIndex}.questionText`]}</div>}
                                    </div>

                                    {/* Question Type */}
                                    <div className="mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Question Type</label>
                                        <select
                                            value={question.type}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleQuestionChange(qIndex, 'type', e.target.value as Question['type'])}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            <option value="multiple-choice">Multiple Choice</option>
                                            <option value="true-false">True/False</option>
                                            <option value="short-answer">Short Answer</option>
                                        </select>
                                    </div>

                                    {/* NEW: Difficulty Level */}
                                    <div className="mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                                        <select
                                            value={question.difficulty}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleQuestionChange(qIndex, 'difficulty', e.target.value as Question['difficulty'])}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="average">Average</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>

                                    {/* Display existing options for multiple-choice questions */}
                                    {question.type === 'multiple-choice' && question.options && (
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700">Options</label>
                                            {question.options.map((option, oIndex) => (
                                                <div key={option.id || oIndex} className="flex items-center space-x-2 mt-1">
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm text-sm"
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        checked={option.isCorrect}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptionIsCorrectChange(qIndex, oIndex, e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Correct</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(qIndex, oIndex)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addOption(qIndex)}
                                                className="mt-2 inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                                            >
                                                Add Option
                                            </button>
                                        </div>
                                    )}

                                    {/* Placeholder for other question types (True/False, Short Answer) */}
                                    {question.type === 'true-false' && (
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                                            <select
                                                value={String(question.trueFalseAnswer)} // Convert boolean to string for select value
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleQuestionChange(qIndex, 'trueFalseAnswer', e.target.value === 'true')}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            >
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                        </div>
                                    )}

                                    {question.type === 'short-answer' && (
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                                            <input
                                                type="text"
                                                value={question.shortAnswer || ''}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(qIndex, 'shortAnswer', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Time Limit and Points */}
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Time Limit (seconds)</label>
                                            <input
                                                type="number"
                                                value={question.timeLimit || ''}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value) || null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Points</label>
                                            <input
                                                type="number"
                                                value={question.points || ''}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    {/* TODO: Image upload/display for existing questions */}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addQuestion}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 mb-6"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                            </button>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" /> {processing ? 'Updating...' : 'Update Quiz'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
