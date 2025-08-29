import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, ChangeEvent } from 'react';
import { PlusCircle, FileText, Clock, Star, Code, PlayCircle, Eye } from 'lucide-react'; // Import PlayCircle and Eye icon
import Swal from 'sweetalert2'; // Import Swal for toasts
import 'sweetalert2/dist/sweetalert2.min.css';
import { Info } from 'lucide-react'; 
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
}

interface Quiz {
    id: number;
    title: string;
    statusquiz: string;
    status: 'published' | 'draft' | 'archived'; // Essential for filtering tabs
    created_at: string; // ISO 8601 string
    questions: Question[];
    user_id: number;
    updated_at: string;
    code: string | null; // Added: To display the quiz code
}

// Define User interface from usePage().props
interface User {
    id: number;
    name: string;
    email: string;
    role: number;
}

export default function Dashboard() {
    const { auth } = usePage().props as { auth: { user: User } };
    const user: User = auth.user;

    const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
    const [joinedQuizzes, setJoinedQuizzes] = useState<Quiz[]>([]); // New state for joined quizzes
    const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'archive'>('published');
    const [loadingMyQuizzes, setLoadingMyQuizzes] = useState<boolean>(true); // Separate loading state
    const [loadingJoinedQuizzes, setLoadingJoinedQuizzes] = useState<boolean>(true); // Separate loading state
    const [errorMyQuizzes, setErrorMyQuizzes] = useState<string | null>(null);
    const [errorJoinedQuizzes, setErrorJoinedQuizzes] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState<string>(''); // State for join code input
    const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

    // Effect to get CSRF token once the component mounts and DOM is fully ready
    useEffect(() => {
        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (token) {
            setCsrfToken(token);
        } else {
            console.error("CSRF token meta tag not found in DOM!");
        }
    }, []);

    // Effect to fetch quizzes created by the user
    useEffect(() => {
        const fetchMyQuizzes = async () => {
            setLoadingMyQuizzes(true);
            setErrorMyQuizzes(null);
            try {
                const response = await fetch('/quizzes/my');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Quiz[] = await response.json();
                setMyQuizzes(data);
            } catch (err) {
                console.error("Failed to fetch quizzes created by user:", err);
                setErrorMyQuizzes("Failed to load your quizzes. Please try again.");
            } finally {
                setLoadingMyQuizzes(false);
            }
        };

        fetchMyQuizzes();
    }, []);

    // Effect to fetch quizzes joined by the user
    useEffect(() => {
        const fetchJoinedQuizzes = async () => {
            setLoadingJoinedQuizzes(true);
            setErrorJoinedQuizzes(null);
            try {
                const response = await fetch('/quizzes/myj');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Quiz[] = await response.json();
                setJoinedQuizzes(data);
            } catch (err) {
                console.error("Failed to fetch joined quizzes:", err);
                setErrorJoinedQuizzes("Failed to load joined quizzes. Please try again.");
            } finally {
                setLoadingJoinedQuizzes(false);
            }
        };

        fetchJoinedQuizzes();
    }, []);

    // Filter quizzes based on active tab
    const filteredMyQuizzes = myQuizzes.filter(quiz => {
        if (activeTab === 'published') {
            return quiz.status === 'published';
        } else if (activeTab === 'drafts') {
            return quiz.status === 'draft';
        } else if (activeTab === 'archive') {
            return quiz.status === 'archived';
        }
        return false;
    });

    // Calculate counts for each tab
    const publishedCount = myQuizzes.filter(q => q.status === 'published').length;
    const draftsCount = myQuizzes.filter(q => q.status === 'draft').length;
    const archiveCount = myQuizzes.filter(q => q.status === 'archived').length;

    // Function to format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleJoinQuiz = async () => {
        if (!joinCode.trim()) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Please enter a join code.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        const tokenToUse = csrfToken || (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        if (!tokenToUse) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'CSRF token not found. Please refresh the page.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            console.error("Attempted to send request without CSRF token.");
            return;
        }

        try {
            const response = await fetch('/quizzes/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': tokenToUse,
                },
                body: JSON.stringify({ code: joinCode }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: result.message || 'Successfully joined the quiz!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                setJoinCode('');
                const joinedResponse = await fetch('/quizzes/myj');
                if (joinedResponse.ok) {
                    const updatedJoinedQuizzes: Quiz[] = await joinedResponse.json();
                    setJoinedQuizzes(updatedJoinedQuizzes);
                }
                if (result.quiz_id) {
                    window.location.href = `/quizzes/${result.quiz_id}`;
                }
            } else {
                const iconType = response.status === 400 ? 'warning' : 'error';
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: iconType,
                    title: result.message || 'Quiz not found or failed to join.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        } catch (err) {
            console.error("Error joining quiz:", err);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'An error occurred while trying to join the quiz.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-red-600 mb-8">My Library</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="bg-white shadow rounded-lg p-4 border">
                                    <h2 className="text-xl font-semibold mb-2">Created by me</h2>
                                    <hr className="border-black mb-4" />

                                    <Link
                                        href={('/createquiz')}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150 mb-4"
                                    >
                                        <PlusCircle size={18} className="mr-2" /> Create New Quiz
                                    </Link>

                                    {loadingMyQuizzes && <p className="text-gray-600">Loading your quizzes...</p>}
                                    {errorMyQuizzes && <p className="text-red-500">{errorMyQuizzes}</p>}

                                    {!loadingMyQuizzes && !errorMyQuizzes && filteredMyQuizzes.length === 0 && (
                                        <p className="text-gray-500">No quizzes found in this category.</p>
                                    )}

                                    <div className="space-y-4">
                                        {!loadingMyQuizzes && !errorMyQuizzes && filteredMyQuizzes.map(quiz => (
                                            <div key={quiz.id} className="bg-gray-100 rounded-lg p-4 flex items-start gap-4 shadow-sm">
                                                <img
                                                    src={quiz.questions[0]?.image_path ? `/storage/${quiz.questions[0].image_path}` : "https://placehold.co/96x96/e0e0e0/333333?text=Quiz"}
                                                    alt="Quiz Thumbnail"
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div>
                                                    <h3 className="text-red-600 text-lg font-semibold">{quiz.title}</h3>
                                                    {quiz.code && (
                                                        <p className="text-sm text-gray-700 mt-1 flex items-center gap-2 font-medium">
                                                            <Code size={16} /> Quiz Code: {quiz.code}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                                                        <FileText size={16} /> {quiz.questions.length} Questions
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                        <Clock size={16} /> Created: {formatDate(quiz.created_at)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                        <Star size={16} /> Total Points: {quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                                                    </p>
                                                    <div className="mt-2 flex gap-2">
                                                            <Link
                                                            href={route('quizzes.show', quiz.id)}
                                                            className="text-blue-600 hover:underline text-sm flex items-center"
                                                        >
                                                            <Info size={16} className="mr-1" /> Details
                                                        </Link>
                                                        <Link
                                                            href={route('quizzes.edit', quiz.id)}
                                                            className="text-green-600 hover:underline text-sm flex items-center"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                                                            </svg>
                                                            Edit
                                                        </Link>
                                                        {/* NEW: Link to Live Session */}
                                                        {quiz.status === 'published' && ( // Only show live session for published quizzes
                                                            <Link
                                                                href={route('quizzes.live_session', quiz.id)}
                                                                className="text-purple-600 hover:underline text-sm flex items-center"
                                                            >
                                                                <Eye size={16} className="mr-1" /> View Live Session
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="bg-white shadow rounded-lg p-4 border mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Quiz Status</h2>
                                    <div className="flex justify-between text-sm font-semibold mb-2 border-b pb-2">
                                        <button
                                            onClick={() => setActiveTab('published')}
                                            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'published' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            Published ({publishedCount})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('drafts')}
                                            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'drafts' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            Drafts ({draftsCount})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('archive')}
                                            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'archive' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            Archive ({archiveCount})
                                        </button>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-4">
                                        Quizzes filtered by status are shown in the "Created by me" section. Click on a tab to see quizzes of that status.
                                    </p>
                                </div>

                                <div className="bg-white shadow rounded-lg p-4 border">
                                    <h2 className="text-xl font-semibold mb-2">Joined Quizzes</h2>
                                    <hr className="border-black mb-4" />
                                    {loadingJoinedQuizzes && <p className="text-gray-600">Loading joined quizzes...</p>}
                                    {errorJoinedQuizzes && <p className="text-red-500">{errorJoinedQuizzes}</p>}

                                    {!loadingJoinedQuizzes && !errorJoinedQuizzes && joinedQuizzes.length === 0 && (
                                        <p className="text-gray-500">No joined quizzes to display yet.</p>
                                    )}

                                    <div className="space-y-4">
                                        {!loadingJoinedQuizzes && !errorJoinedQuizzes && joinedQuizzes.map(quiz => (
                                            <div key={quiz.id} className="bg-gray-100 rounded-lg p-4 flex items-start gap-4 shadow-sm">
                                                <img
                                                    src={quiz.questions[0]?.image_path ? `/storage/${quiz.questions[0].image_path}` : "https://placehold.co/96x96/e0e0e0/333333?text=Quiz"}
                                                    alt="Quiz Thumbnail"
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div>
                                                    <h3 className="text-blue-600 text-lg font-semibold">{quiz.title}</h3>
                                                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                                                        <FileText size={16} /> {quiz.questions.length} Questions
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                        <Clock size={16} /> Created: {formatDate(quiz.created_at)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                        <Star size={16} /> Total Points: {quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                                                    </p>
                                                    <div className="mt-2">
                                                       <div className="mt-2 flex gap-2">
                                                         <Link
                                                             href={route('quizzes.starting', quiz.id)}
                                                             className="text-blue-600 hover:underline text-sm flex items-center"
                                                         >
                                                             <PlayCircle size={16} className="mr-1" /> Start
                                                         </Link>
                                                       </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
