import Footer from "@/CustomComponents/Footer";
import { router } from "@inertiajs/react";
import axios from "axios";
import { ArrowRight, Calendar, CheckCircle, Mail, Sparkles, Trash2, Trash2Icon } from "lucide-react";
import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';

type Props = {};

const JoinPage = (props: Props) => {
    const [joinCode, setJoinCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState([{ name: "" }]);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [lobbyCode, setLobbyCode] = useState(null)
    const [subjects, setSubjects] = useState([]);
    const [participantId, setParticipantId] = useState(null);
    // Pre-registration form states
    // Pre-registration form states
    const [formData, setFormData] = useState({
        teamName: '',
        teamLeader: '',
        teamLeaderEmail: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            setCsrfToken(token);
        } else {
            console.error("CSRF token meta tag not found.");
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'CSRF token not found. Please refresh the page.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    }, []);

    const handleJoin = async () => {
        setIsJoining(true); // Disable button immediately
        setShowLoginPrompt(false); // Hide prompt at the start of a new attempt

        if (!joinCode.trim()) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Please enter a join code.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            setIsJoining(false);
            return;
        }

        if (!csrfToken) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'CSRF token is missing. Please refresh the page.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            console.error("Attempted to send request without CSRF token.");
            setIsJoining(false);
            return;
        }

        try {
            const response = await fetch('/quizzes/join', { // Use actual endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ code: joinCode }),
            });

            // If Laravel's auth middleware redirects due to unauthenticated user (often due to CSRF token mismatch for logged-out users)
            if (response.redirected) {
                setShowLoginPrompt(true); // Show the login prompt
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'warning',
                    title: 'Your session has expired. Please log in to join the quiz.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                }).then(() => {
                    window.location.href = response.url; // Redirect to /login
                });
                return;
            }

            const result = await response.json();

            if (response.ok) { // Check for 2xx status codes
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: result.message || 'Successfully joined the quiz!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                setJoinCode(''); // Clear the input field
                setShowLoginPrompt(false); // Hide the prompt on success

                if (result.quiz_id) {
                    window.location.href = `/quizzes/${result.quiz_id}/starting`;
                } else {
                    console.warn("Joined quiz, but no quiz_id for redirection.");
                }
            } else { // Handle non-2xx status codes
                let errorMessage = result.message || 'Quiz not found or failed to join.';
                if (response.status === 422 && result.errors) {
                    const validationErrors = Object.values(result.errors).flat();
                    errorMessage = validationErrors.join(' ') || errorMessage;
                } else if (response.status === 403) {
                    errorMessage = 'You do not have permission to join this quiz.';
                } else if (response.status === 419) { // CSRF Token Mismatch/Session Expired
                    errorMessage = 'Your session has expired. Please log in to join the quiz.';
                    setShowLoginPrompt(true); // Show the login prompt for 419 as well
                }

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: errorMessage,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Error joining quiz:", error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'An error occurred while trying to join the quiz.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } finally {
            setIsJoining(false); // Re-enable button
        }
    };

    const handlePreRegistration = async () => {

  
        if (!csrfToken) {
            console.error('CSRF token not found');
            return;
        }

        setIsJoining(true);
        setIsSubmitting(true);
        try {
            const response = await fetch('/participant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    "team": formData.teamName,
                    "team_leader": formData.teamLeader,
                    "team_leader_email": formData.teamLeaderEmail,
                    "subject": selectedSubjects[0],
                    members: JSON.stringify(members),
                    "lobbyCode": lobbyCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setParticipantId(data.user.id)
                setCurrentStep(3);
            } else if (response.status === 401) {
                setShowLoginPrompt(true);
            } else if (data.error === 'Team name already exists') {
                Swal.fire({
                    icon: 'error',
                    title: 'Team Name Already Exists',
                    text: 'Please choose a different team name.',
                    confirmButtonColor: '#f97316',
                });
            } else {
                throw new Error(data.error || 'Failed to create team');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while creating the team. Please try again.',
                confirmButtonColor: '#f97316',
            });
        } finally {
            setIsJoining(false);
            setIsSubmitting(false);
        }
    };

    const verifyTeam = async (teamNameToVerify: string) => {
        if (!csrfToken) {
            console.error('CSRF token not found');
            return;
        }

        try {
            const response = await fetch('/participant/verify-team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken, // If CSRF is required
                },
                body: JSON.stringify({ team_name: teamNameToVerify })
            });

            const data = await response.json();

            if (data.exists) {

                await axios.get(`/participant-code-update/${data.id}/${lobbyCode}`)
                setParticipantId(data.id)
                setTeamName(teamNameToVerify);
                setCurrentStep(3);
                Swal.fire({
                    icon: 'success',
                    title: 'Team Found!',
                    text: 'Please proceed with subject selection.',
                    confirmButtonColor: '#f97316',
                });
                // router.get(`lobby/${data.id}`)
            } else if (response.status === 401) {
                setShowLoginPrompt(true);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Team Not Found',
                    text: 'Please check the team name or create a new team.',
                    confirmButtonColor: '#f97316',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while verifying the team. Please try again.',
                confirmButtonColor: '#f97316',
            });
        }
    };

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const handleSubjectSelection = async () => {
        const filteredSubject = subjects.filter(subject => selectedSubjects.includes(subject.subject_name))

        if (filteredSubject.length < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'No Subjects Selected',
                text: 'Please select at least one subject to continue.',
                confirmButtonColor: '#f97316',
            });
            return;
        }

        router.get(`/lobby/${subjects[0]['lobby_id']}/${filteredSubject[0].id}/${participantId}`)

        //  alert((`/lobby/${subjects[0]['lobby_id']}/${filteredSubject[0].id}`))


    };

    const handleEnterCode = async () => {
        try {
            const response = await axios.get(`/check-lobby-code/${lobbyCode}`)

            setSubjects(response.data)
            setCurrentStep(2)
        } catch (error) {

            if (error.status == 404) {
                Swal.fire({
                    icon: 'error',
                    title: 'Code not Found',
                    text: 'Please get a valid code.',
                    confirmButtonColor: '#f97316',
                });
            }
            console.log(error)
        }
    }
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

      const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 14); // 14 days from now
  const inviteDate = new Date();
  inviteDate.setDate(inviteDate.getDate() + 9); // 5 days before event
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center  flex items-start justify-center relative"
            style={{
                backgroundImage: "url('/images/bgonly.png')",
            }}
        >
            <div className="relative z-10 w-full max-w-md px-6 text-center pt-0 flex flex-col justify-start items-center">
                <img
                    src="/images/carousel/logooo.png"
                    alt="Logo"
                    className=""
                />
                <div className="bg-white/90 rounded-lg p-6 shadow-lg w-fit min-w-[30rem]">
                    {/* Stepper */}
                    <div className="mb-6 flex justify-center items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-red-600 text-white' : 'bg-red-200'}`}>1</div>
                        <div className={`w-16 h-1 ${currentStep === 2 ? 'bg-red-600' : 'bg-red-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-red-600 text-white' : 'bg-red-200'}`}>2</div>
                        <div className={`w-16 h-1 ${currentStep === 3 ? 'bg-red-600' : 'bg-orange-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-red-600 text-white' : 'bg-red-200'}`}>3</div>
                    </div>
                    {currentStep === 1 ?
                        <div>
                            <div className="flex flex-col justify-start text-left gap-y-2">

                                <label className="text-orange-600 font-bold" >Enter Lobby Code</label>
                                <input
                                    type="text"
                                    placeholder="Lobby Code"
                                    value={lobbyCode}
                                    onChange={(e) => setLobbyCode(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">

                                <button
                                    onClick={() => handleEnterCode()}
                                    className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>

                        : ""}
                    {/* Step 2: Pre-Registration Form */}
                    {currentStep === 2 && (
                        <div className="w-[50rem]">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Pre-Registration Form</h2>
                            <div className="text-left mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Select Subject * </label>
                                <select
                                    value={selectedSubjects[0] || ''}
                                    onChange={(e) => setSelectedSubjects(e.target.value ? [e.target.value] : [])}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white"
                                    required
                                >
                                    <option value="">Choose a subject...</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.subject_name} value={subject.subject_name}>
                                            {subject.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                {/* Team Name */}
                                {/* <div className="text-left">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Team Name *</label>
                                    <input
                                        type="text"
                                        value={formData.teamName}
                                        onChange={(e) => handleFormChange('teamName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                                        required
                                    />
                                </div> */}

                                {/* Team Leader Information */}
                                <div className="bg-gray-50 p-4 rounded-lg text-left">
                                    <h3 className="font-semibold text-gray-700 mb-3 text-center">Team Leader</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Team Leader Name *</label>
                                            <input
                                                type="text"
                                                value={formData.teamLeader}
                                                onChange={(e) => handleFormChange('teamLeader', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Team Leader Email *</label>
                                            <input
                                                type="email"
                                                value={formData.teamLeaderEmail}
                                                onChange={(e) => handleFormChange('teamLeaderEmail', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-700 mb-3">Team Members</h3>

                                    <div className="space-y-2">
                                        <div className="pr-5 max-h-44 overflow-y-scroll">
                                            {members.map((member, index) => (
                                                <div key={index} className="flex gap-y-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder={`Member ${index + 1} Name`}
                                                        value={member.name}
                                                        onChange={(e) => {
                                                            const newMembers = [...members];
                                                            newMembers[index].name = e.target.value;
                                                            setMembers(newMembers);
                                                        }}
                                                        className="w-full mb-2 mr-2 p-3 border border-gray-300 rounded-lg text-gray-800"
                                                    />
                                                    {members.length > 1 && (
                                                        <Trash2
                                                            className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                                                            onClick={() => {
                                                                const newMembers = members.filter((_, i) => i !== index);
                                                                setMembers(newMembers);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setMembers([...members, { name: "" }])}
                                            className="w-full p-2 mt-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                                        >
                                            + Add Member
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="flex-1 py-2 px-4 rounded-lg border-2 border-red-600 text-red-600 hover:bg-orange-50 transition duration-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePreRegistration}
                                        disabled={isSubmitting}
                                        className={`flex-1 py-3 px-6 rounded-lg text-white font-semibold 
                                            ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
                                            transition duration-200`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Pre-Registration'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep == 3 ? (
                        <div className="w-[50rem]">
                            {/* Animated background elements */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                            </div>

                      
                            <div className={`relative z-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
                                }`}>
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 w-full shadow-2xl border border-white/20">

                                    {/* Success Icon */}
                                    <div className="relative mb-8">
                                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                            <CheckCircle className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="absolute -top-2 -right-2">
                                            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                                        </div>
                                    </div>

                                    {/* Main Message */}
                                    <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                                            Successfully Registered!
                                        </h1>
                                        <p className="text-gray-600 leading-relaxed">
                                            You're all set for the event. We're excited to have you join us!
                                        </p>
                                    </div>

                                    {/* Event Details Cards */}
                                    <div className="space-y-4 mb-8">
                                        {/* Event Date Card */}
                                        {/* <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center space-x-6 hover:bg-red-100 transition-colors duration-300">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                                <Calendar className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex flex-col justify-start">
                                                <h3 className="font-semibold text-gray-800 text-start">Event Date</h3>
                                                <p className="text-sm text-gray-600">{eventDate.toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</p>
                                            </div>
                                        </div> */}

                                        {/* Invite Link Card */}
                                        {/* <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center space-x-6 hover:bg-blue-100 transition-colors duration-300">
                                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Mail className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex flex-col justify-start">
                                                <h3 className="font-semibold text-gray-800 text-start">Invite Link</h3>
                                                <p className="text-sm text-gray-600">
                                                    Expect your invite link on {inviteDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div> */}
                                    </div>

                                    {/* Call to Action */}
                                    <div className="text-center space-y-4">
                                        {/* <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2">
                                            <span>Add to Calendar</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div> */}

                                        <p className="text-xs text-gray-500">
                                            Keep an eye on your email for updates and your event invite link
                                        </p>
                                    </div>

                                    {/* Decorative bottom border */}
                                    <div className="mt-8 h-1 bg-gradient-to-r from-red-400 via-red-600 to-red-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ) : ""}
                </div>

                {showLoginPrompt && (
                    <p className="mt-4 text-center text-red-700 text-lg font-semibold">
                        Please <a href="/login" className="underline hover:text-red-900">Login</a> to join.
                    </p>
                )}
            </div>

            <Footer />

            <div className="absolute bottom-0 left-0 right-0">
                <img
                    src="/images/icons/footer.png"
                    alt="Footer"
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default JoinPage;