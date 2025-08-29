import axios from 'axios';
import React, { useState, useEffect } from 'react';

type Props = {
    teamName?: string;
}

const QuizLobby = ({ teamName = 'Team Alpha' }: Props) => {
    const [lobbyName, setLobbyName] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const [participants, setParticipants] = useState<string[]>([]);
    const [availableLobbies, setAvailableLobbies] = useState<any>(['Lobby 1', 'Lobby 2', 'Lobby 3']); // This should be populated from your backend

    const handleJoinLobby = () => {
        if (!lobbyName.trim()) return;
        setIsWaiting(true);
        // Here you would typically connect to your backend
        // and start listening for other participants
    };

    const getLobbies = async () => {
        try {
            const response = await axios.get("/organizer-lobbies")

            console.log("ress", response)

            setAvailableLobbies(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getLobbies()
    }, [])
    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {!isWaiting ? (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            Join Quiz Lobby
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="lobbyName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select a Lobby
                                </label>
                                <select
                                    id="lobbyName"
                                    value={lobbyName}
                                    onChange={(e) => setLobbyName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                >
                                    <option value="">Choose a lobby...</option>
                                    {availableLobbies.map((lobby) => (
                                        <option key={lobby} value={lobby}>{lobby.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleJoinLobby}
                                disabled={!lobbyName.trim()}
                                className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors duration-200
                                    ${lobbyName.trim()
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Join Lobby
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Waiting Room
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Lobby: {lobbyName}
                            </p>
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 font-semibold">
                                        Waiting
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                                <p className="text-orange-800 font-medium">
                                    Team: {teamName}
                                </p>
                                <p className="text-orange-600 text-sm mt-2">
                                    The quiz will start automatically when ready
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizLobby;