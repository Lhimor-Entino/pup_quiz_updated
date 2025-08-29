import Footer from "@/CustomComponents/Footer";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Trash2Icon } from "lucide-react";
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

    const handleAddTeam = async () => {
        if (!csrfToken) {
            console.error('CSRF token not found');
            return;
        }

        setIsJoining(true);

        try {
            const response = await fetch('/participant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    "team": teamName,
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
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center flex items-start justify-center relative"
            style={{
                backgroundImage: "url('/images/bgonly.png')",
            }}
        >
            <div className="relative z-10 w-full max-w-md px-6 text-center pt-0 flex flex-col justify-start">
                <img
                    src="/images/carousel/logooo.png"
                    alt="Logo"
                    className=""
                />

                <div className="bg-white/90 rounded-lg p-6 shadow-lg">
                    {/* Stepper */}
                    <div className="mb-6 flex justify-center items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-orange-500 text-white' : 'bg-orange-200'}`}>1</div>
                        <div className={`w-16 h-1 ${currentStep === 2 ? 'bg-orange-500' : 'bg-orange-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-orange-500 text-white' : 'bg-orange-200'}`}>2</div>
                        <div className={`w-16 h-1 ${currentStep === 3 ? 'bg-orange-500' : 'bg-orange-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-orange-500 text-white' : 'bg-orange-200'}`}>3</div>
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
                                    className="flex-1 py-2 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition duration-200"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>

                        : ""}
                    {currentStep === 2 ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleAddTeam(); }} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Team Name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800"
                                required
                            />

                            <div className="space-y-2">
                                <div className="pr-5 max-h-44 overflow-y-scroll">
                                    {members.map((member, index) => (
                                        <div key={index} className="flex gap-y-2 items-center">
                                            <input
                                                type="text"
                                                placeholder={index === 0 ? "Team Leader" : `Member ${index + 1}`}
                                                value={member.name}
                                                onChange={(e) => {
                                                    const newMembers = [...members];
                                                    newMembers[index].name = e.target.value;
                                                    setMembers(newMembers);
                                                }}
                                                className="w-full mb-2 mr-2 p-3 border border-gray-300 rounded-lg text-gray-800"
                                                required={index === 0}
                                            />
                                            {members.length > 1 && (
                                                <Trash2Icon
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

                            <button
                                type="submit"
                                disabled={isJoining}
                                className={`w-full mt-4 py-3 px-6 rounded-lg text-white font-semibold 
                                    ${isJoining ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}
                                    transition duration-200`}
                            >
                                {isJoining ? 'Submitting...' : 'Submit'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    Swal.fire({
                                        title: 'Enter Team Name',
                                        input: 'text',
                                        inputLabel: 'Team Name',
                                        inputPlaceholder: 'Enter your team name',
                                        showCancelButton: true,
                                        confirmButtonText: 'Check Team',
                                        confirmButtonColor: '#f97316',
                                        cancelButtonText: 'Cancel',
                                        inputValidator: (value) => {
                                            if (!value) {
                                                return 'You need to enter a team name!';
                                            }
                                        }
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            verifyTeam(result.value);
                                        }
                                    });
                                }}
                                className="w-full mt-2 py-2 px-6 rounded-lg text-orange-500 font-semibold border-2 border-orange-500 hover:bg-orange-50 transition duration-200"
                            >
                                Already Have a Team?
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 py-2 px-4 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition duration-200"
                                >
                                    Back
                                </button>

                            </div>
                        </form>
                    ) : ""}

                    {currentStep == 3 ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Subjects</h2>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {subjects.map((subject) => (
                                    <button
                                        key={subject}
                                        disabled={selectedSubjects.length > 0 ? selectedSubjects.includes(subject.subject_name) ? false : true : false}
                                        onClick={() => toggleSubject(subject.subject_name)}
                                        className={`p-3 rounded-lg border-2 transition duration-200 ${selectedSubjects.includes(subject.subject_name)
                                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                                            : 'border-gray-300 hover:border-orange-400 text-gray-600'}`}
                                    >
                                        {subject.subject_name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 py-2 px-4 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition duration-200"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubjectSelection}
                                    className="flex-1 py-2 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition duration-200"
                                >
                                    Continue
                                </button>
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