
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Clock, Star, Trophy, User, Users } from 'lucide-react';
type Props = {
  quizTitle?: string;
  subject?: string;
}

type Team = {
  name: string;
  members: string[];
}

const Lobby = () => {
  const [started, setStarted] = useState(false);
  const { id, subject, subject_id, team_id } = usePage().props;
  const { auth } = usePage<PageProps>().props;
  const [teams, setTeams] = useState<any[]>([]);
  const [startId, setStartId] = useState(null)
  const [redirect, setRedirect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<string | null>(null);
  const [hoveredTeam, setHoveredTeam] = useState(null);
  useEffect(() => {
    const channel = window.Echo.channel('quiz-room_' + id);
    console.log(channel)
    channel.listen('QuizEvent', (e: any) => {
      console.log('Received event:', e);
      setState(e.state);
    });

    return () => {
      window.Echo.leave('quiz-room');
    };
  }, []);

  const getTeams = async () => {
    try {
      const response = await axios.get(`/teams/${id}/${subject_id}`)
      setTeams(response.data)

    } catch (error) {
      console.log(error)
    }
  }


  const getCurrentQuestion = async () => {
    try {
      const response = await axios.get(`/lobby-status/${id}`)

      if (response.data[0].started == 1) {
        setRedirect(true)
        //       axios.get(`/questionnaire/${response.data[0].id}/${team_id}/${subject_id}`)

        setStartId(response.data[0].id)

      }
    } catch (error) {
      console.log(error)
    }
  }
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const handleStartQuiz = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/lobby-start/${id}`)

      if (response.data == 1) {
        router.get(`/questionnaire/${id}/${team_id}/${subject_id}`)
      }


    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }

  }


  useEffect(() => {
    if (state == "start-quiz" && !auth.user) { // for participant redirect
      router.get(`/questionnaire/${id}/${team_id}/${subject_id}`)
    }
  }, [state])

  useEffect(() => {
    // run immediately once
    getTeams();

    // then repeat every 5 seconds
    const interval = setInterval(() => {
      getTeams();
    }, 5000);

    // cleanup when leaving the page / component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthenticatedLayout>
      <Head title="Event Rooms Lobby" />


      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Quiz Title */}
          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-orange-100 p-8 mb-8 text-center overflow-hidden group">
            {/* Subtle background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5"></div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-orange-300/30 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-orange-200/50">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-orange-600 mb-4 uppercase tracking-tight">
                {subject['subject_name']}
              </h1>
              <div className="flex items-center justify-center gap-2 text-orange-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Ready to begin</span>
              </div>
            </div>
          </div>

          {teams.length < 1 &&

            <div className="mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700 mb-3">
                    No Active Participant Yet
                  </div>
                  <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
                </div>
              </div>
            </div>}
          {/* Enhanced Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

            {teams?.map((team, index) => {
              const isHovered = hoveredTeam === index;

              return (
                <div
                  key={index}
                  className={`group relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl border border-orange-100 overflow-hidden transition-all duration-500 ${isHovered ? 'scale-105 -translate-y-3 shadow-orange-200/50' : 'hover:scale-[1.02]'}`}
                  onMouseEnter={() => setHoveredTeam(index)}
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  {/* Orange gradient top border */}
                  <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>

                  {/* Floating orange orb */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-orange-400/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

                  <div className="relative p-6">
                    {/* Team Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-200/40 group-hover:shadow-xl group-hover:shadow-orange-200/60 transition-all duration-300">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-orange-900 group-hover:text-orange-800 transition-colors duration-300">
                          {team.team}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                          <User className="w-3 h-3" />
                          <span>{JSON.parse(team.members).length} members</span>
                        </div>
                      </div>
                    </div>

                    {/* Members List with enhanced styling */}
                    <div className="space-y-3">
                      {JSON.parse(team.members).map((member, mIndex) => (
                        <div
                          key={mIndex}
                          className="group/member flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50/60 transition-all duration-300 cursor-pointer"
                        >
                          {/* Member Avatar */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center shadow-md group-hover/member:shadow-lg transition-shadow duration-300">
                            <span className="text-white text-sm font-bold">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>

                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-orange-800 group-hover/member:text-orange-900 transition-colors duration-300 truncate">
                              {member.name}
                            </p>
                          </div>

                          {/* Status indicator */}
                          <div className="w-2 h-2 rounded-full bg-orange-400 group-hover/member:bg-orange-500 transition-colors duration-300"></div>
                        </div>
                      ))}
                    </div>

                    {/* Team Footer Stats */}
                    <div className="mt-6 pt-4 border-t border-orange-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-600">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">Team Ready</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(JSON.parse(team.members).length)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${i < Math.min(JSON.parse(team.members).length, JSON.parse(team.members).length)
                                ? 'bg-orange-400'
                                : 'bg-orange-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>

          {/* Waiting Message */}
          {!auth.user && (
            <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-orange-100 mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-orange-600 font-medium">Waiting for the Quiz Master to start...</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-1 mt-4">
                <div className="bg-orange-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Enhanced Start Button */}
          {(auth?.user?.role == 1 || auth?.user?.role == 3) && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleStartQuiz}
                disabled={loading || teams.length < 1}
                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl shadow-orange-200/50 hover:shadow-orange-300/60 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                {/* Button background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                <div className="relative flex items-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Starting Please Wait...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      <span>Proceed to Quiz</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Lobby;