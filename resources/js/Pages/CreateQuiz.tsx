import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useMemo, ChangeEvent } from 'react';
import { X, PlusCircle, Eye, Save, LogOut, Trash2, Copy, Clock, List, Star, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Define interfaces for better type safety, matching backend snake_case for saving
interface Option {
    id: number;
    text: string; // Frontend uses 'text' for input, will map to 'option_text' for backend
    isCorrect: boolean; // Frontend uses 'isCorrect', will map to 'is_correct' for backend
}

interface Question {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    questionText: string; // Frontend uses 'questionText', will map to 'question_text' for backend
    image: string | null; // Frontend uses 'image' (base64), will map to 'image_path' for backend
    options: Option[];
    trueFalseAnswer: boolean | null; // Frontend uses 'trueFalseAnswer', will map to 'true_false_answer' for backend
    shortAnswer: string; // Frontend uses 'shortAnswer', will map to 'short_answer' for backend
    timeLimit: string; // Frontend uses 'timeLimit', will map to 'time_limit' for backend
    points: string;
    difficulty: 'easy' | 'average' | 'hard'; // New: Difficulty level
    showDetails: boolean;
}

export default function CreateQuizPage() {
    const [showModal, setShowModal] = useState<boolean>(true);
    const [quizTitle, setQuizTitle] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [previewContent, setPreviewContent] = useState<React.ReactNode[]>([]);
    const [showPreview, setShowPreview] = useState<boolean>(false);

    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const handleBlankCanvasClick = (): void => {
        setShowModal(false);
    };

    const addQuestion = (type: 'multiple-choice' | 'true-false' | 'short-answer'): void => {
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
                difficulty: 'easy', // Default difficulty
                showDetails: true,
            }
        ]);
    };

    const handleQuestionChange = (id: number, field: keyof Question, value: string | boolean | null): void => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q => q.id === id ? { ...q, [field]: value } : q)
        );
    };

    const handleOptionChange = (questionId: number, optionId: number, field: keyof Option, value: string | boolean): void => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map(opt =>
                            opt.id === optionId ? { ...opt, [field]: value } : opt
                        ),
                    }
                    : q
            )
        );
    };

    const handleCorrectAnswerChange = (questionId: number, optionId: number): void => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map(opt => ({
                            ...opt,
                            isCorrect: opt.id === optionId,
                        })),
                    }
                    : q
            )
        );
    };

    const handleTrueFalseChange = (questionId: number, value: boolean): void => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q => q.id === questionId ? { ...q, trueFalseAnswer: value } : q)
        );
    };

    const handleImageUpload = (questionId: number, event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuestions(prevQuestions =>
                    prevQuestions.map(q => q.id === questionId ? { ...q, image: reader.result as string } : q)
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleQuestionDetails = (id: number): void => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q => q.id === id ? { ...q, showDetails: !q.showDetails } : q)
        );
    };

    const updatePreview = (): void => {
        const newPreviewContent = questions.map((q, index) => (
            <div key={q.id} className="mb-2 p-2 border rounded-md bg-gray-50">
                <p className="font-semibold">Question {index + 1}: {q.questionText || `Untitled ${q.type}`}</p>
                <p className="text-xs text-gray-600">Difficulty: {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}</p> {/* Display difficulty */}
                {q.type === 'multiple-choice' && (
                    <ul className="list-disc ml-5 text-sm">
                        {q.options.map(opt => (
                            <li key={opt.id} className={opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                                {opt.text || 'Option'} {opt.isCorrect && '(Correct)'}
                            </li>
                        ))}
                    </ul>
                )}
                {q.type === 'true-false' && (
                    <p className="text-sm">Correct Answer: {q.trueFalseAnswer !== null ? (q.trueFalseAnswer ? 'True' : 'False') : 'Not set'}</p>
                )}
                {q.type === 'short-answer' && (
                    <p className="text-sm">Correct Answer: {q.shortAnswer || 'Not set'}</p>
                )}
                {q.timeLimit && <p className="text-sm">Time Limit: {q.timeLimit} seconds</p>}
                {q.points && <p className="text-sm">Points: {q.points}</p>}
                {q.image && <img src={q.image} alt="Question" className="mt-2 h-20 w-auto object-cover rounded" />}
            </div>
        ));
        setPreviewContent(newPreviewContent);
        setShowPreview(true);
    };

    const totalPoints = useMemo<number>(() => {
        return questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);
    }, [questions]);

    const totalTimeLimit = useMemo<number>(() => {
        return questions.reduce((sum, q) => sum + (parseInt(q.timeLimit) || 0), 0);
    }, [questions]);

    const totalQuestionsCount = questions.length;

    const handleSave = (): void => {
        const quizData = {
            title: quizTitle,
            questions: questions.map(q => ({
                type: q.type,
                questionText: q.questionText,
                image: q.image,
                timeLimit: q.timeLimit ? parseInt(q.timeLimit) : null,
                points: q.points ? parseInt(q.points) : null,
                difficulty: q.difficulty, // Include difficulty in the saved data
                options: q.type === 'multiple-choice' ? q.options.map(opt => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                })) : null,
                trueFalseAnswer: q.type === 'true-false' ? (q.trueFalseAnswer === true || q.trueFalseAnswer === false ? q.trueFalseAnswer : null) : null,
                shortAnswer: q.type === 'short-answer' ? (q.shortAnswer || null) : null,
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

    const handleExit = (): void => {
        setShowModal(true);
        setQuestions([]);
        setQuizTitle('');
        setPreviewContent([]);
        setShowPreview(false);
    };

    const handleDelete = (id: number): void => {
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
    };

    const handleDuplicate = (id: number): void => {
        const questionToDuplicate = questions.find(q => q.id === id);
        if (questionToDuplicate) {
            const duplicatedQuestion: Question = { ...questionToDuplicate, id: Date.now(), questionText: `${questionToDuplicate.questionText} (Copy)`, showDetails: true };
            setQuestions(prevQuestions => [...prevQuestions, duplicatedQuestion]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Quiz" />

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Create a new quiz</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border rounded-lg p-4 shadow-md text-center cursor-not-allowed opacity-60">
                                <img src="https://placehold.co/96x96/e0e0e0/333333?text=PDF" alt="PDF to Quiz" className="mx-auto mb-2 w-24 h-24 object-contain" />
                                <h3 className="font-semibold">PDF to Quiz</h3>
                                <p className="text-sm text-gray-600 mb-2">Generate or extract questions from your PDF</p>
                                <button className="border border-red-500 text-red-500 px-3 py-1 rounded cursor-not-allowed">AI Assisted</button>
                            </div>
                            <div className="border rounded-lg p-4 shadow-md text-center cursor-not-allowed opacity-60">
                                <img src="https://placehold.co/96x96/e0e0e0/333333?text=Notes" alt="Notes to Quiz" className="mx-auto mb-2 w-24 h-24 object-contain" />
                                <h3 className="font-semibold">Notes to Quiz</h3>
                                <p className="text-sm text-gray-600 mb-2">Generate extract questions from your Notes</p>
                                <button className="border border-red-500 text-red-500 px-3 py-1 rounded cursor-not-allowed">AI Assisted</button>
                            </div>
                            <div className="border rounded-lg p-4 shadow-md text-center flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleBlankCanvasClick}>
                                <PlusCircle size={48} className="text-gray-500 mb-2" />
                                <h3 className="font-semibold">Blank Canvas</h3>
                                <p className="text-sm text-gray-600">Create a quiz from scratch</p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 - Quiz Questions */}
                <div>
                    <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                    <input
                        id="quiz-title"
                        type="text"
                        placeholder="Enter Quiz Title"
                        className="w-full border p-3 mb-4 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                        value={quizTitle}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuizTitle(e.target.value)}
                    />

                    <div className="space-y-4">
                        {questions.map((q) => (
                            <div key={q.id} className="border rounded-lg p-4 shadow-md bg-white">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-lg cursor-pointer" onClick={() => toggleQuestionDetails(q.id)}>
                                        Question: {q.questionText || `Untitled ${q.type}`}
                                    </h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={20} />
                                        </button>
                                        <button onClick={() => handleDuplicate(q.id)} className="text-gray-500 hover:text-gray-700">
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>

                                {q.showDetails && (
                                    <>
                                        <div className="mb-3">
                                            <label htmlFor={`question-text-${q.id}`} className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                            <input
                                                id={`question-text-${q.id}`}
                                                type="text"
                                                placeholder="Enter question text"
                                                className="w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                value={q.questionText}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                                            <select
                                                className="w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                value={q.type}
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleQuestionChange(q.id, 'type', e.target.value as Question['type'])}
                                            >
                                                <option value="multiple-choice">Multiple Choice</option>
                                                <option value="true-false">True/False</option>
                                                <option value="short-answer">Short Answer</option>
                                            </select>
                                        </div>

                                        {/* New: Difficulty Level Selection */}
                                        <div className="mb-3">
                                            <label htmlFor={`difficulty-${q.id}`} className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                                            <select
                                                id={`difficulty-${q.id}`}
                                                className="w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                value={q.difficulty}
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleQuestionChange(q.id, 'difficulty', e.target.value as Question['difficulty'])}
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="average">Average</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>

                                        {q.type === 'multiple-choice' && (
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options (Select correct one)</label>
                                                {q.options.map((opt, index) => (
                                                    <div key={opt.id} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-answer-${q.id}`}
                                                            checked={opt.isCorrect}
                                                            onChange={() => handleCorrectAnswerChange(q.id, opt.id)}
                                                            className="form-radio text-red-600"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={`Option ${index + 1}`}
                                                            className="flex-grow border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                            value={opt.text}
                                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptionChange(q.id, opt.id, 'text', e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === 'true-false' && (
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                                                <div className="flex gap-4">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`true-false-${q.id}`}
                                                            value="true"
                                                            checked={q.trueFalseAnswer === true}
                                                            onChange={() => handleTrueFalseChange(q.id, true)}
                                                            className="form-radio text-red-600"
                                                        />
                                                        <span className="ml-2">True</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`true-false-${q.id}`}
                                                            value="false"
                                                            checked={q.trueFalseAnswer === false}
                                                            onChange={() => handleTrueFalseChange(q.id, false)}
                                                            className="form-radio text-red-600"
                                                        />
                                                        <span className="ml-2">False</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {q.type === 'short-answer' && (
                                            <div className="mb-3">
                                                <label htmlFor={`short-answer-${q.id}`} className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                                <input
                                                    id={`short-answer-${q.id}`}
                                                    type="text"
                                                    placeholder="Enter short answer"
                                                    className="w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                    value={q.shortAnswer}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(q.id, 'shortAnswer', e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label htmlFor={`time-limit-${q.id}`} className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                                            <input
                                                id={`time-limit-${q.id}`}
                                                type="number"
                                                placeholder="e.g., 30"
                                                className="w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                value={q.timeLimit}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(q.id, 'timeLimit', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor={`points-${q.id}`} className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                            <input
                                                id={`points-${q.id}`}
                                                type="number"
                                                placeholder="e.g., 10"
                                                className="w-full border p-2 rounded-md focus:ring-red-500 focus:border-red-500"
                                                value={q.points}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(q.id, 'points', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor={`image-upload-${q.id}`} className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                                            <input
                                                id={`image-upload-${q.id}`}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={el => fileInputRefs.current[q.id] = el}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleImageUpload(q.id, e)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRefs.current[q.id]?.click()}
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-300 transition-colors"
                                            >
                                                <ImageIcon size={18} /> Upload Image
                                            </button>
                                            {q.image && (
                                                <div className="mt-2 relative">
                                                    <img src={q.image} alt="Question Preview" className="h-24 w-auto object-cover rounded-md" />
                                                    <button
                                                        onClick={() => handleQuestionChange(q.id, 'image', null)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                        aria-label="Remove image"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => addQuestion('multiple-choice')}
                            className="bg-red-600 text-white rounded-full px-6 py-2 shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <PlusCircle size={20} /> Add Multiple Choice
                        </button>
                        <button
                            onClick={() => addQuestion('true-false')}
                            className="bg-red-600 text-white rounded-full px-6 py-2 shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <PlusCircle size={20} /> Add True/False
                        </button>
                        <button
                            onClick={() => addQuestion('short-answer')}
                            className="bg-red-600 text-white rounded-full px-6 py-2 shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <PlusCircle size={20} /> Add Short Answer
                        </button>
                    </div>
                </div>

                {/* Column 2 - Preview */}
                <div className="space-y-4 relative">
                    <div className="p-4 bg-white rounded-lg shadow-md h-full min-h-[200px]">
                        <h4 className="font-bold text-xl mb-3 text-gray-800">Quiz Preview</h4>
                        {showPreview ? (
                            previewContent.length > 0 ? (
                                <div>
                                    <h5 className="font-semibold text-lg mb-2">{quizTitle || "Untitled Quiz"}</h5>
                                    {previewContent}
                                </div>
                            ) : (
                                <p className="text-gray-500">No questions to preview yet. Add some questions!</p>
                            )
                        ) : (
                            <p className="text-gray-500">Click 'Preview' button to see your quiz layout.</p>
                        )}
                    </div>
                </div>

                {/* Column 3 - Settings and Actions */}
                <div className="space-y-4">
                    <button
                        onClick={updatePreview}
                        className="flex items-center justify-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md w-full hover:bg-gray-300 transition-colors font-semibold"
                    >
                        <Eye size={18} className="mr-2" /> Preview
                    </button>
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={handleSave}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md flex-1 flex items-center justify-center hover:bg-red-700 transition-colors font-semibold"
                        >
                            <Save size={18} className="mr-2" /> Save
                        </button>
                        <button
                            onClick={handleExit}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md flex-1 flex items-center justify-center hover:bg-gray-300 transition-colors font-semibold"
                        >
                            <LogOut size={18} className="mr-2" /> Exit
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-3 text-gray-800">Quiz Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700">
                                <List size={18} className="text-red-500" /> <span className="font-medium">Total Questions:</span>
                                <span>{totalQuestionsCount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock size={18} className="text-blue-500" /> <span className="font-medium">Total Time Limit:</span>
                                <span>{totalTimeLimit} seconds</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Star size={18} className="text-yellow-500" /> <span className="font-medium">Total Points:</span>
                                <span>{totalPoints}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}