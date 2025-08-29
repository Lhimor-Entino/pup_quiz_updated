import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, ChangeEvent } from 'react';
import { PlusCircle, FileText, Clock, Star, Code } from 'lucide-react'; // Import icons
import Swal from 'sweetalert2'; // Import Swal for toasts
import 'sweetalert2/dist/sweetalert2.min.css';

// Define interfaces for quiz data received from backend, matching snake_case
interface Option {
    id: number;
    option_text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    quiz_id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question_text: string;
    image_path: string | null;
    options: Option[];
    true_false_answer: boolean | null;
    short_answer: string | null;
    time_limit: number | null;
    points: number | null;
}

interface Quiz {
    id: number;
    title: string;
    status: 'published' | 'draft' | 'archived'; // Essential for filtering tabs
    created_at: string; // ISO 8601 string
    questions: Question[];
    user_id: number;
    updated_at: string;
    code: string | null; // To display the quiz code
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
    const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'archive'>('published');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState<string>(''); // State for join code input
    // Added state to store CSRF token once it's retrieved
    const [csrfToken, setCsrfToken] = useState<string | null>(null); 

    // Effect to get CSRF token once the component mounts and DOM is fully ready
    useEffect(() => {
        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (token) {
            setCsrfToken(token);
        } else {
            console.error("CSRF token meta tag not found in DOM!");
            // Optionally show a user-friendly error or toast here
        }
    }, []); // Runs once on component mount

    useEffect(() => {
        const fetchMyQuizzes = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch quizzes created by the authenticated user
                const response = await fetch('/quizzes/my');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Quiz[] = await response.json();
                setMyQuizzes(data);
            } catch (err) {
                console.error("Failed to fetch quizzes:", err);
                setError("Failed to load quizzes. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyQuizzes();
    }, []); // Empty dependency array means this runs once on mount

    // Filter quizzes based on active tab
    const filteredQuizzes = myQuizzes.filter(quiz => {
        // Ensure quiz.status exists and matches the active tab
        if (activeTab === 'published') {
            return quiz.status === 'published';
        } else if (activeTab === 'drafts') {
            return quiz.status === 'draft';
        } else if (activeTab === 'archive') {
            return quiz.status === 'archived';
        }
        return false; // Should not happen if tabs are exhaustive
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

        // Use the CSRF token stored in state. If for some reason it's still null, try to query it again.
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
       
                if (result.quiz_id) {
                    window.location.href = `/quizzes/${result.quiz_id}/starting`;
                }
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Main Card - Hello User */}
                                <div
                                    className="bg-white shadow rounded-lg p-6"
                                    style={{ backgroundImage: 'url(/images/card.jpg)', backgroundSize: 'cover' }}
                                >
                                    <h2 className="text-3xl font-semibold text-white"> Hello, {user?.name || 'Guest'}</h2>
                                    <p className="mt-4 text-white text-lg">Let's put your knowledge to the test!</p>
                                </div>

                                {/* Join Code Card */}
                                <div
                                    className="bg-white shadow rounded-lg p-6 border-2 border-red-500"
                                    style={{ backgroundImage: 'url(/images/card2.jpg)', backgroundSize: 'cover' }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Enter Join Code"
                                        className="mt-4 p-2 rounded-md w-full text-black"
                                        value={joinCode}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value)}
                                    />
                                    <button
                                        onClick={handleJoinQuiz}
                                        className="mt-4 w-full bg-red-500 text-white p-3 rounded-md text-lg hover:bg-red-600 transition-colors"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-lg font-semibold text-gray-800">Discover</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                    {/* Flashcards Card */}
                                    <div className="bg-white shadow rounded-lg overflow-hidden">
                                        <img
                                            src="/images/quiz.png"
                                            alt="Flashcards"
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold">Flashcards</h3>
                                        </div>
                                    </div>

                                    {/* Convert PDF/Docs to Quiz Card */}
                                    <div className="bg-white shadow rounded-lg overflow-hidden">
                                        <img
                                            src="/images/quiz4.png"
                                            alt="Convert PDF/Docs to Quiz"
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold">Convert PDF/Docs to Quiz</h3>
                                        </div>
                                    </div>

                                    {/* Generate a Quiz Instantly with AI Card */}
                                    <div className="bg-white shadow rounded-lg overflow-hidden">
                                        <img
                                            src="/images/quiz3.png"
                                            alt="Generate Quiz Instantly"
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold">Generate a Quiz Instantly with AI</h3>
                                        </div>
                                    </div>

                                    {/* Create Your Own Quiz on a Blank Canvas Card */}
                                         <a href="/createquiz" className="block">
                                    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition">
                                        <img
                                        src="/images/quiz2.png"
                                        alt="Create Your Own Quiz"
                                        className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                        <h3 className="text-lg font-semibold">Create Your Own Quiz on a Blank Canvas</h3>
                                        </div>
                                    </div>
                                    </a>
                                </div>
                            </div>

                          
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}