import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Import Swal for toasts
import 'sweetalert2/dist/sweetalert2.min.css';
export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState('published');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinCode, setJoinCode] = useState(''); // State for join code input
    // Added state to store CSRF token once it's retrieved
    const [csrfToken, setCsrfToken] = useState(null);
    // Effect to get CSRF token once the component mounts and DOM is fully ready
    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        if (token) {
            setCsrfToken(token);
        }
        else {
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
                const data = await response.json();
                setMyQuizzes(data);
            }
            catch (err) {
                console.error("Failed to fetch quizzes:", err);
                setError("Failed to load quizzes. Please try again.");
            }
            finally {
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
        }
        else if (activeTab === 'drafts') {
            return quiz.status === 'draft';
        }
        else if (activeTab === 'archive') {
            return quiz.status === 'archived';
        }
        return false; // Should not happen if tabs are exhaustive
    });
    // Calculate counts for each tab
    const publishedCount = myQuizzes.filter(q => q.status === 'published').length;
    const draftsCount = myQuizzes.filter(q => q.status === 'draft').length;
    const archiveCount = myQuizzes.filter(q => q.status === 'archived').length;
    // Function to format date for display
    const formatDate = (dateString) => {
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
        const tokenToUse = csrfToken || document.querySelector('meta[name="csrf-token"]')?.content;
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
                    window.location.href = `/quizzes/${result.quiz_id}/start`;
                }
            }
            else {
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
        }
        catch (err) {
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
    return (_jsxs(AuthenticatedLayout, { children: [_jsx(Head, { title: "Dashboard" }), _jsx("div", { className: "py-12", children: _jsx("div", { className: "mx-auto max-w-7xl sm:px-6 lg:px-8", children: _jsx("div", { className: "overflow-hidden bg-white shadow-sm sm:rounded-lg", children: _jsxs("div", { className: "p-6 text-gray-900", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white shadow rounded-lg p-6", style: { backgroundImage: 'url(/images/card.jpg)', backgroundSize: 'cover' }, children: [_jsxs("h2", { className: "text-3xl font-semibold text-white", children: [" Hello, ", user?.name || 'Guest'] }), _jsx("p", { className: "mt-4 text-white text-lg", children: "Let's put your knowledge to the test!" })] }), _jsxs("div", { className: "bg-white shadow rounded-lg p-6 border-2 border-red-500", style: { backgroundImage: 'url(/images/card2.jpg)', backgroundSize: 'cover' }, children: [_jsx("input", { type: "text", placeholder: "Enter Join Code", className: "mt-4 p-2 rounded-md w-full text-black", value: joinCode, onChange: (e) => setJoinCode(e.target.value) }), _jsx("button", { onClick: handleJoinQuiz, className: "mt-4 w-full bg-red-500 text-white p-3 rounded-md text-lg hover:bg-red-600 transition-colors", children: "Join" })] })] }), _jsxs("div", { className: "mt-8 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-gray-800", children: "Discover" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6", children: [_jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("img", { src: "/images/quiz.png", alt: "Flashcards", className: "w-full h-48 object-cover" }), _jsx("div", { className: "p-4", children: _jsx("h3", { className: "text-lg font-semibold", children: "Flashcards" }) })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("img", { src: "/images/quiz4.png", alt: "Convert PDF/Docs to Quiz", className: "w-full h-48 object-cover" }), _jsx("div", { className: "p-4", children: _jsx("h3", { className: "text-lg font-semibold", children: "Convert PDF/Docs to Quiz" }) })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("img", { src: "/images/quiz3.png", alt: "Generate Quiz Instantly", className: "w-full h-48 object-cover" }), _jsx("div", { className: "p-4", children: _jsx("h3", { className: "text-lg font-semibold", children: "Generate a Quiz Instantly with AI" }) })] }), _jsx("a", { href: "/createquiz", className: "block", children: _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition", children: [_jsx("img", { src: "/images/quiz2.png", alt: "Create Your Own Quiz", className: "w-full h-48 object-cover" }), _jsx("div", { className: "p-4", children: _jsx("h3", { className: "text-lg font-semibold", children: "Create Your Own Quiz on a Blank Canvas" }) })] }) })] })] })] }) }) }) })] }));
}
