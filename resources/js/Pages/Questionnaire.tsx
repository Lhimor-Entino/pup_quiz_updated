import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/Components/ui/toggle-group';
import LeaderBoardIcon from '@/CustomComponents/LeaderBoardIcon';
import LeaderboardModal from '@/CustomComponents/LeaderBoardModal';
import LoadingText from '@/CustomComponents/Loader';
import { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCheckIcon, CheckIcon, FileQuestionIcon, Loader, Loader2Icon, NotepadTextDashed, PrinterIcon, RefreshCcw, TrophyIcon, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2';


const Questionnaire = () => {

  const { id, team_id, subject_id, quiz_state, current_question, options_revealed, items, item_number, current_level, levels_finished } = usePage().props;
  const { auth } = usePage<PageProps>().props;

  const [loading, setLoading] = useState(false)

  const [loading2, setLoading2] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [shortAnswerSubmitted, setShortAnswerSubmitted] = useState(false)
  const [seconds, setSeconds] = useState(-1);
  const secondsRef = useRef(seconds)
  const [state, setState] = useState<any | null>(quiz_state || null);
  const [currentQuestion, setCurrentQuestion] = useState(current_question);
  const [level, setLevel] = useState("")
  const [itemNumber, setItemNumber] = useState(item_number)
  const [particapantShortAns, setParticapantShortAns] = useState([])
  const [savedShortAnswer, setSaveShortAnswer] = useState([])
  const [savingShortAns, setSavingShortAns] = useState(false)
  const [showLevelCard, setShowLevelCard] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(current_level);
  const [showLevelSelection, setShowLevelSelection] = useState(false)
  const [finishedLevels, setFinishedLevels] = useState([])
  const levels = [
    {
      id: 'easy',
      name: 'EASY',
      color: 'bg-gradient-to-br from-orange-300 to-orange-400',
      hoverColor: 'hover:from-orange-400 hover:to-orange-500',
      description: 'Perfect for new players',
      icon: '🌟'
    },
    {
      id: 'average',
      name: 'AVERAGE',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      description: 'A balanced challenge',
      icon: '🔥'
    },
    {
      id: 'hard',
      name: 'HARD',
      color: 'bg-gradient-to-br from-orange-700 to-orange-800',
      hoverColor: 'hover:from-orange-800 hover:to-orange-900',
      description: 'For the brave players',
      icon: '⚡'
    }
  ];

  // const enterFullscreen = () => {
  //   const elem = document.documentElement;
  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen();
  //   }
  // };

  // useEffect(() => {
  //   // First gesture (click/tap) triggers fullscreen
  //   const handleFirstClick = () => {
  //     enterFullscreen();
  //     document.removeEventListener("click", handleFirstClick);
  //   };
  //   document.addEventListener("click", handleFirstClick);

  //   // If user exits fullscreen (Esc, F11, resize) → force back
  //   const handleFullscreenChange = () => {
  //     if (!document.fullscreenElement) {
  //       enterFullscreen();
  //     }
  //   };
  //   document.addEventListener("fullscreenchange", handleFullscreenChange);

  //   // Extra check on resize
  //   const handleResize = () => {
  //     if (!document.fullscreenElement) {
  //       enterFullscreen();
  //     }
  //   };
  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     document.removeEventListener("click", handleFirstClick);
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);


  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     console.log("Current active element:", document.activeElement);
  //     if (e.key === "F11") {
  //       e.preventDefault(); // Stop fullscreen toggle
  //       e.stopPropagation();
  //       document.body.focus();
  //       // alert("F11 is disabled!");
  //     }
  //     if (e.key === "Escape") {
  //       e.preventDefault();  // stop default action
  //       e.stopPropagation(); // stop bubbling
  //       document.body.focus();
  //       alert("Escape is disabled!");
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, []);


  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    console.log('Selected level:', level);
  };

  useEffect(() => {
    if (!levels_finished || levels_finished !== "") {

      const lf = (levels_finished as string).split("-")

      setFinishedLevels(lf)
    }
  }, [levels_finished])

  useEffect(() => {
    const channel = window.Echo.channel('quiz-room_' + id);
    console.log(channel)
    channel.listen('QuizEvent', (e: any) => {
      console.log('Received event:', e);
      setState(e.state);
      setCurrentQuestion(e.current_question)
      setItemNumber(e.item_number)
      setSelectedLevel(e.current_level)


    });

    return () => {
      window.Echo.leave('quiz-room');
    };
  }, []);

  const updateScore = async (score: any, option, short_ans?: any) => {


    if (auth.user) return

    try {
      let ans = score == -1 ? " -- " : option.text

      if (option == "true") {
        ans = 'TRUE'


      }
      if (option == "false") {
        ans = 'FALSE'
      }
      if (short_ans) {
        ans = short_ans
      }
      if (currentQuestion['type'] == "short-answer") {
        if (option == null || option == "null") {
          ans = "No Answer"
        } else {
          ans = option
        }

      }
      const prev_score = localStorage.getItem("prev_score")
      const new_question = localStorage.getItem("new_question")
      const res = await axios.get(`/updateScore/${team_id}/${score}/${ans}/${currentQuestion['question']}/${id}/${currentQuestion['id']}/${currentQuestion['type']}/${prev_score}/${new_question}`)

      if (res.data) {
        localStorage.setItem('prev_score', res.data.prev_score)
      }
      sumbmitAlert()

    } catch (error) {
      console.log(error)
    }
  }
  const handleRevealOptions = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/lobby-revealOptions/${id}/${subject_id}`)

      if (response.data == 1) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Options Revealed',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#399918',
          iconColor: '#399918 ',
        });
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }


  }
  const handleRevealAnswer = async () => {
    setLoading(true)
    try {
      await axios.get(`/lobby-revealAnswer/${id}/${subject_id}`)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Answer Revealed',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff',
        color: '#399918',
        iconColor: '#399918 ',
      });
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }
  const handleRevealLeaderboard = async () => {


    setLoading(true)
    try {
      await axios.get(`/lobby-revealLeaderboard/${id}/${subject_id}/${items}`)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Leaderboard Revealed',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff',
        color: '#399918',
        iconColor: '#399918 ',
      });
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }


  }

  const handleShowOverAllLeaderBoard = async () => {
    setLoading2(true)
    try {

      await axios.get(`/showOverAllLeaderBoard/${id}/${subject_id}`)

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Over All Leaderboard Revealed',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff',
        color: '#399918',
        iconColor: '#399918 ',
      });
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading2(false)
    }
  }
  const handleStartTimer = async () => {
    setLoading(true)
    try {
      await axios.get(`/lobby-startTimer/${id}/${subject_id}`)

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Timer Started',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff',
        color: '#399918',
        iconColor: '#399918 ',
      });
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {

    setLoading(true)
    try {
      const response = await axios.get(`/lobby-nextquestion/${id}/${subject_id}`)

      if (response.data.status == 200) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'New question loaded',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#399918',
          iconColor: '#399918 ',
        });
        setSelectedOption(null)
        setSelectedLevel(null)
        localStorage.setItem("new_question", "yes")
      }
      console.log(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  const sumbmitAlert = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Answer Submitted.',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#fff',
      color: '#399918',
      iconColor: '#399918 ',
    });
  }

  const submitAnswer = (option) => {



    if (auth.user) return;
    setSelectedOption(option)

    // if (option == null) {
    //   updateScore(-1, option)
    //   return
    // }

    // const type = currentQuestion['type']

    // if (type == "short-answer") {
    //   updateScore(currentQuestion['points'], option)
    //   return
    // }

    // if (option == "false" || option == "true") {
    //   const ans = currentQuestion['trueFalseAnswer']

    //   if (option == "true" && ans == 1 || option == "false" && ans == 0) {
    //     updateScore(currentQuestion['points'], option)
    //   } else {
    //     updateScore(0, option)
    //   }
    //   return
    // }
    // if (option.isCorrect) {

    //   updateScore(currentQuestion['points'], option)

    // } else {
    //   updateScore(0, option)
    // }




  }

  const handleCloseEvent = async () => {

    console.log("Leaderboard", leaderboard)
    // return;
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("leaderboard", JSON.stringify(leaderboard))
      const response = await axios.post(`/close-event/${id}/${subject_id}`, formData)

      if (response.data.status == 200) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'New question loaded',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#399918',
          iconColor: '#399918 ',
        });
      }

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const getLeaderboard = async () => {

    try {
      const response = await axios.get(`/leaderboard/${id}/${subject_id}`)

      setLeaderboard(response.data)
    } catch (error) {
      console.log(error)
    }
  }
  const getCurrentQuestionLeaderboard = async () => {


    try {
      const response = await axios.get(`/currentQuestionLeaderboard/${id}/${currentQuestion['id']}`)


      const formatted = response.data.map(item => ({

        lobby_id: item.lobby_id,
        question: item.question,
        question_id: item.question_id,

        prev_answer: item.answer, // renamed from "answer"
        id: item.participant_id, // renamed from "participant_id"
        team: item.participant_name,
        score: item.points, // renamed from "points"

        prev_answer_correct: parseInt(item.points) > 0 ? 1 : 0 // added based on score
      }))

      setLeaderboard(formatted)

      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getParticipantShortAnswer = async () => {
    try {
      const response = await axios.get(`/participant-shor-answer/${id}`)

      setParticapantShortAns(response.data)

    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveShortAnswer = (id, status) => {

    setSaveShortAnswer(prev => {
      const exists = prev.find(item => item.id === id);
      if (exists) {
        // Update existing item
        return prev.map(item =>
          item.id === id ? { ...item, status } : item
        );
      } else {
        // Add new item
        return [...prev, { id, status, points: currentQuestion['points'] }];
      }
    });
  };
  const handleSave = async () => {
    setSavingShortAns(true)
    try {
      const formData = new FormData()
      formData.append("participants", JSON.stringify(savedShortAnswer))
      const response = await axios.post('/participant-answer-update', formData)

      if (response.data == 1) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Answer Submitted.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#399918',
          iconColor: '#399918 ',
        });
        setParticapantShortAns([])
      }
    } catch (error) {
      console.log(error)
    } finally {
      setSavingShortAns(false)
    }
  }
  const handleGenerateReport = async () => {
    setSavingShortAns(true); // Indicate that a process is starting (downloading)
    try {
      // Make the GET request. Crucially, set responseType to 'blob'
      // This tells axios to expect binary data and return it as a Blob object.

      const response = await axios.get(`/report/teams/excel/${id}`, {
        responseType: 'blob', // Important! This tells Axios to handle the response as binary data (Blob)
      });

      // Check if the response is successful
      if (response.status === 200) {
        // --- Extract Filename (Optional but Recommended) ---
        // Try to get the filename from the Content-Disposition header
        let filename = 'teams_report.xlsx'; // Default filename if header is not present
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        // --- Create a Download Link ---
        // Create a URL for the Blob data
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Create a temporary <a> tag
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // Set the download attribute with the filename
        document.body.appendChild(link); // Append to body (required for Firefox)
        link.click(); // Programmatically click the link to trigger download
        link.remove(); // Clean up the temporary link

        // Revoke the object URL to free up memory
        window.URL.revokeObjectURL(url);

        // Show success message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success', // Changed to success icon for download
          title: 'Report downloaded successfully!', // Appropriate message
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#399918',
          iconColor: '#399918',
        });
      } else {
        // Handle non-200 responses if necessary
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: `Download failed: ${response.status}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#dc3545',
          iconColor: '#dc3545',
        });
      }
    } catch (error) {
      console.error('Error during report download:', error);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'An error occurred during download.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff',
        color: '#dc3545',
        iconColor: '#dc3545',
      });
    } finally {
      setSavingShortAns(false); // Reset loading state
    }
  };
  const handleSaveGameLevel = async () => {
    try {
      const res = await axios.get(`/lobby-gameLevel/${id}/${selectedLevel}/${subject_id}`)
      if (res.data) {

        setShowLevelSelection(false)
        setTimeout(() => {

          handleChangeState()
        }, 3000);
      }
    } catch (error) {
      if (error.response.data.status == "error") {

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#fff',
          color: '#dc3545',
          iconColor: '#dc3545',
        });
        return
      }
      console.log(error)
    }
  }
  const handleChangeState = async () => {
    try {
      const res = await axios.get(`/lobby-changeState/${id}/${selectedLevel}/${subject_id}`)
    } catch (error) {
      console.log(error)
    }


  }
  useEffect(() => {
    // if(state =="answer-revealed"){
    //   alert("Save Answer")
    // }
    if (state == 'leaderboard-revealed' || state == "finished") {

      getCurrentQuestionLeaderboard()
      setSelectedOption(null) // reset the selected answer
    }
    if (state == 'event-closed') {
      router.get(`/lobby/${id}/${subject_id}/${team_id}`)
    }
  }, [state])

  useEffect(() => {
    if (state != 'timer-started') return
    // if(seconds == null) return
    if (seconds == 0) {
      if (!auth.user) {
        if (selectedOption == null) {
          updateScore(-1, selectedOption)
        } else {
       

          const type = currentQuestion['type']

          if (type == "short-answer") {
            updateScore(currentQuestion['points'], selectedOption)
            return
          }

          if (selectedOption == "false" || selectedOption == "true") {
            const ans = currentQuestion['trueFalseAnswer']

            if (selectedOption == "true" && ans == 1 || selectedOption == "false" && ans == 0) {
              updateScore(currentQuestion['points'], selectedOption)
            } else {
              updateScore(0, selectedOption)
            }
            return
          }
          if (selectedOption.isCorrect) {

            updateScore(currentQuestion['points'], selectedOption)

          } else {
            updateScore(0, selectedOption)
          }

        }

      }

    }
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      secondsRef.current = secondsRef.current - 1; // or --secondsRef.current;

      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, state]);

  useEffect(() => {
    if (seconds == 0) {
      if (auth.user) return
      if (!currentQuestion) return
      const type = currentQuestion['type']
      if (type == "short-answer") {
        updateScore(currentQuestion['points'], selectedOption)
        return
      }
    }
  }, [seconds])

  useEffect(() => {
    if (currentQuestion) {

      setSeconds(currentQuestion['timeLimit'])
      setLevel(currentQuestion['difficulty'])
      setShortAnswerSubmitted(false)
      setParticapantShortAns([])
      if (itemNumber as number <= 1) {
        localStorage.setItem("new_question", "no")
        //  localStorage.setItem("prev_score","0")
      } else {
        localStorage.setItem("new_question", "yes")
      }

    }


  }, [currentQuestion])


  useEffect(() => {
    if (!currentQuestion) return
    if (currentQuestion['type'] == 'short-answer' && auth?.user && seconds == 0 && state == 'timer-started') {
      getParticipantShortAnswer()
    }

  }, [currentQuestion, seconds, state])

  // useEffect(() => {
  //   if(!auth?.user && seconds == 0 && state=="timer-started"){
  //       alert("save answer")
  //   }
  // },[seconds])

  useEffect(() => {
    setShowLevelCard(true)
  }, [level])

  // useEffect(() => {
  //   if (showLevelCard) {

  //     setTimeout(() => {
  //       alert(3)
  //       handleChangeState()
  //     }, 3000);
  //   }
  // }, [showLevelCard])


  useEffect(() => {

    if (state == 'over-all-leaderboard' || state == "finished") {
      getLeaderboard()
    }

  }, [state])
  useEffect(() => {
    // if (!selectedLevel) {
    //   setShowLevelSelection(true)
    // }
    setShowLevelSelection(true)

  }, [selectedLevel])

  const getNewLevel = async () => {
    try {
      const response = await axios.get(`/getLevel/${id}`)

      console.log(response)

      if (response.data.level) {
        const lf = response.data.level.split("-")
        setFinishedLevels(lf)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (state == "switch-new-level") {
      getNewLevel()

    }

  }, [state, level])
  const [isModalOpen, setIsModalOpen] = useState(false);

  const restricted_state = ["timer-started", "options-revealed", "over-all-leaderboard", "finished", "answer-revealed", "leaderboard-revealed"]
  const e_state = ["timer-started", "options-revealed", "answer-revealed",]
  const myLevels = ["easy", "average", "difficult"]
  return (
    <div className="min-h-screen bg-yellow-200 pt-8 flex justify-center items-start">
      <div className="w-[80%] flex flex-col justify-center items-end gap-y-10">

        {/* {JSON.stringify(selectedLevel)}
      {JSON.stringify(showLevelSelection)}
      {JSON.stringify(currentQuestion)}
        {state}{items} */}
        {
          state != "level-changes" && state != "general" && !restricted_state.includes(state) && state != "" || state == "switch-new-level"
            ? <div className="absolute w-full h-full bg-gradient-to-br from-yellow-300 via-orange-200 to-orange-300 top-0 left-0 z-50">
              <div className="w-full flex justify-center items-center min-h-screen p-8">
                <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-2xl w-full border border-orange-300/30">
                  {/* {state}{items} */}

                  {/* Decorative top border */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent rounded-full mb-12"></div>

                  <div className="flex flex-col items-center gap-y-12">
                    {/* Title with glow effect */}
                    <div className="text-center">
                      <h1 className="text-white text-6xl font-black uppercase tracking-wider drop-shadow-2xl">
                        {!auth?.user ? "Choosing Your" : "Choose Your"}
                      </h1>
                      <h2 className="text-orange-100 text-5xl font-black uppercase tracking-wider drop-shadow-2xl mt-2">
                        Challenge Level {level}
                      </h2>
                      <div className="w-32 h-1 bg-gradient-to-r from-orange-200 to-orange-100 mx-auto mt-6 rounded-full"></div>
                    </div>

                    {/* Level selection cards */}
                    <div className="flex flex-col gap-y-6 w-full">
                      {levels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => handleLevelSelect(level.id)}
                          disabled={finishedLevels.includes(level.id)}
                          className={`
        ${level.color} ${level.hoverColor}
        text-white font-bold
        p-6 rounded-2xl
        transform transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-2xl hover:-translate-y-1
        ${selectedLevel === level.id ? 'ring-4 ring-orange-200 ring-opacity-60 scale-105 shadow-2xl' : 'shadow-lg'}
        border border-white/20
        group relative overflow-hidden
        ${finishedLevels.includes(level.id) ? 'opacity-75 cursor-not-allowed' : ''}
      `}
                        >
                          {/* Subtle shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                          {/* Completion badge */}
                          {finishedLevels.includes(level.id) && (
                            <div className="absolute -top-2 -right-2 z-20">
                              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-white transform rotate-12 animate-pulse">
                                ✓ DONE
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                              <span className="text-4xl">{level.icon}</span>
                              <div className="text-left">
                                <div className="text-2xl font-black uppercase tracking-wide">
                                  {level.name}
                                  {finishedLevels.includes(level.id) && (
                                    <span className="ml-3 text-green-300 text-lg">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="text-orange-100 text-sm font-medium opacity-90">
                                  {finishedLevels.includes(level.id) ? (
                                    <span className="text-green-200 font-semibold">
                                      Completed! 🎉
                                    </span>
                                  ) : (
                                    level.description
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-orange-200">
                              {finishedLevels.includes(level.id) ? (
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Start button with enhanced styling */}
                    {selectedLevel && auth?.user ? (
                      <button
                        onClick={() => handleSaveGameLevel()}
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-orange-900 font-black text-xl py-4 px-12 rounded-full transform transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-orange-400/50 border-2 border-yellow-300 uppercase tracking-wider"
                      >
                        🚀 Proceed to Quiz
                      </button>
                    ) : ""}


                  </div>

                  {/* Decorative bottom border */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent rounded-full mt-12"></div>

                  {/* Floating particles effect */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-orange-200 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute top-12 right-8 w-1 h-1 bg-yellow-300 rounded-full opacity-80 animate-pulse delay-300"></div>
                  <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-orange-100 rounded-full opacity-70 animate-pulse delay-700"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-yellow-200 rounded-full opacity-60 animate-pulse delay-1000"></div>
                </div>
              </div>
            </div> : ""
        }

        {state == "level-changes" ?
          <div className=" absolute w-full h-full bg-yellow-200  top-0 left-0 z-50 ">
            <div className='w-full flex  bg-white   mt-[15%] justify-center items-center flex-col gap-y-20'>
              <div className=' border-2  border-orange-500 w-full' > </div>
              <div className=' flex flex-col items-center'>
                <h1 className="text-orange-500 uppercase text-[8rem] font-bold">{selectedLevel ? selectedLevel : ""} ROUND   </h1>

                <Loader className=' animate-spin text-orange-500 w-20 h-20' />
              </div>
              <div className='border-2 border-orange-500 w-full' > </div>
            </div>

          </div> : ""
        }

        {/* // MODAL LEADERBOARD */}
        <LeaderboardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaderboard={leaderboard}
          team_id={1}
          state="over-all-leaderboard"
          currentQuestion={{ points: 10 }}
        />


        {/* // SHORT ANSWER  MODAL FOR ORGANIZER */}
        <Dialog
          open={particapantShortAns.length > 0 ? true : false}

        >

          <DialogContent className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 shadow-xl w-[800px] max-w-[95vw]">

            <DialogHeader>
              <DialogTitle>
                <div className='flex items-center justify-between w-[95%]'>
                  <h1 className="text-2xl font-bold text-orange-800 mb-4">Participant Answers</h1>

                </div>
                <Button onClick={() => getParticipantShortAnswer()} className='bg-orange-700 hover:bg-orange-600'>
                  <RefreshCcw />
                  Refetch Answers
                </Button>
                <div className="flex items-center gap-x-3 mt-3 bg-white/80 p-4 rounded-xl border border-orange-100 shadow-sm">

                  <p className="text-orange-700 font-medium">Question:</p>
                  <p className="text-orange-900 uppercase">{currentQuestion ? currentQuestion['question'] : ""} ?</p>
                </div>
                <div className="flex items-center gap-x-3 mt-3 bg-white/80 p-4 rounded-xl border border-orange-100 shadow-sm">
                  <p className="text-orange-700 font-medium">Answer:</p>
                  <p className="text-orange-900">{currentQuestion ? currentQuestion['shortAnswer'] : ""}</p>
                </div>
              </DialogTitle>
              <DialogDescription className="mt-6">
                <Table className="border-separate border-spacing-y-3 w-fit" >
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-orange-100/50 to-orange-50/50 rounded-lg">
                      <TableHead className="w-1/4 text-orange-800 font-semibold p-3">Team</TableHead>
                      <TableHead className="w-1/2 text-orange-800 font-semibold p-3">Answer</TableHead>
                      <TableHead className="w-1/4 text-orange-800 font-semibold text-right p-3">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {particapantShortAns.map((rank, index) => (
                      <TableRow key={rank.rank} className="hover:bg-orange-50/80 transition-all duration-300 rounded-xl overflow-hidden">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-x-4">
                            <div className="text-xl font-bold py-2.5 px-5 bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-orange-100">
                              <span className="text-orange-900">{rank.team}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xl font-bold py-2.5 px-5 bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-orange-900 border border-orange-100">
                            {rank.prev_answer}
                          </div>
                        </TableCell>
                        <TableCell className="text-right flex gap-x-3">

                          <ToggleGroup
                            type="single"
                            value={savedShortAnswer.find(item => item.id === rank.id)?.status || ""}
                            onValueChange={(value) => {
                              if (value) {
                                handleSaveShortAnswer(rank.id, value);
                              }
                            }}
                            className="space-x-2"
                          >
                            {["correct", "incorrect"].map((status) => (
                              <ToggleGroupItem
                                key={status}
                                value={status}
                                className={`
                                    data-[state=on]:bg-orange-500 
                                    data-[state=on]:text-white 
                                    border-orange-500 
                                    text-orange-500
                                    hover:bg-orange-100
                                  `}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button className='w-full bg-orange-600 hover:bg-orange-600/50 mt-5' disabled={savedShortAnswer.length !== particapantShortAns.length || savingShortAns} onClick={() => handleSave()}>
                  <LoadingText loading={savingShortAns} text="Saving please wait..." normal_text='Saving Answers' />
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* // SHORT ANSWER  MODAL FOR PARTICIPANTS */}

        {/* <Dialog open={!auth?.user && seconds < 1 && currentQuestion['type'] == 'short-answer' ? true : false}> */}
        {
          currentQuestion &&
          <Dialog open={!auth?.user && seconds < 1 && currentQuestion['type'] == 'short-answer' && state == 'timer-started' ? true : false}>
            <DialogContent className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 shadow-xl w-[800px] max-w-[95vw]">

              <DialogHeader>
                <DialogTitle>
                  <h1 className="text-2xl font-bold text-orange-800 mb-4">Validating answer</h1>
                  <div className="flex items-center gap-x-3 mt-3 bg-white/80 p-4 rounded-xl border border-orange-100 shadow-sm">
                    <p className="text-orange-700 font-medium">Question:</p>

                    <p className="text-orange-900 uppercase">{currentQuestion ? currentQuestion['question'] : ""} ?</p>
                  </div>
                  <div className="flex items-center gap-x-3 mt-3 bg-white/80 p-4 rounded-xl border border-orange-100 shadow-sm">
                    <p className="text-orange-700 font-medium">Answer:</p>
                    <p className="text-orange-900">{currentQuestion ? currentQuestion['shortAnswer'] : ""}</p>
                  </div>
                </DialogTitle>
                <DialogDescription className="mt-6 flex justify-center">


                  <div className="relative z-10 mt-12">
                    <p className="text-orange-800 text-2xl font-bold mb-8">
                      Quiz Master is validating your answer
                    </p>

                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                        <p className="text-orange-700 text-lg font-semibold">
                          Please Wait for the quiz master to proceed ...
                        </p>
                      </div>
                    </div>
                  </div>


                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        }

        {
          auth?.user &&
          <div onClick={() => setIsModalOpen(true)}>
            <LeaderBoardIcon />
          </div>


        }


        {
          <div className='flex gap-x-2 justify-end'>
            {
              state == "timer-started" && auth?.user ?
                <Button disabled={seconds != 0 || loading} className='bg-orange-600 text-3xl px-14 h-20' onClick={() => handleRevealAnswer()}>
                  <LoadingText loading={loading} text="Revealing answer please wait..." normal_text='Reveal Answer' />
                </Button> : ""

            }
            {
              state == 'answer-revealed' && auth?.user ?
                <Button disabled={loading} className='bg-orange-600 text-3xl px-14 h-20' onClick={() => handleRevealLeaderboard()}>
                  <LoadingText loading={loading} text="Revealing leaderboard please wait..." normal_text='Reveal Leaderboard' />
                </Button> : ""
            }
          </div>
        }
        {
          state == "options-revealed" && auth?.user ?
            <div className='flex gap-x-2 justify-end'>
              {
                state == "options-revealed" &&
                <Button className='bg-orange-600 text-3xl px-14 h-20' disabled={loading} onClick={() => handleStartTimer()}>
                  <LoadingText loading={loading} text="Timer Starting wait..." normal_text=' Start Timer' />
                </Button>
              }


            </div>
            :
            ""
        }
        {
          auth?.user && state == "leaderboard-revealed" && itemNumber != items || auth?.user && state == "over-all-leaderboard" && itemNumber != items ?
            <div className='flex gap-x-2 justify-end'>
              <Button disabled={loading} className='bg-orange-600 text-3xl px-14 h-20' onClick={() => handleNextQuestion()}>

                <LoadingText loading={loading} text="Loading next question please wait..." normal_text='Next Question' />
              </Button>

              <Button disabled={loading2} className='bg-orange-600 text-3xl px-14 h-20' onClick={() => handleShowOverAllLeaderBoard()}>

                <LoadingText loading={loading2} text="Loading  please wait..." normal_text='Over All Leaderboard' />
              </Button>
            </div> : ""
        }
        {/* || itemNumber == items && auth?.user && state != "" && !e_state.includes(state) */}

        {
          auth?.user && state == "finished" || itemNumber == items && auth?.user && state == "over-all-leaderboard" && !e_state.includes(state) ?
            <div className='flex gap-x-2 justify-end'>
              <Button disabled={loading} className='bg-orange-600 text-3xl px-14 h-20' onClick={() => handleCloseEvent()}>
                <LoadingText loading={loading} text="Loading next question please wait..." normal_text='Send All to lobby' />
              </Button>
              <Button disabled={loading2} className='bg-orange-600 text-3xl px-14 h-20' onClick={() => handleShowOverAllLeaderBoard()}>

                <LoadingText loading={loading2} text="Loading  please wait..." normal_text='Over All Leaderboard' />
              </Button>
            </div>
            : ""
        }

        {
          auth?.user && state == "general" || auth?.user && state == "" ? <div className='text-right'>
            <Button className='bg-orange-600 text-3xl px-14 h-20' disabled={loading} onClick={() => handleRevealOptions()}>

              <LoadingText loading={loading} text="Revealing please wait..." normal_text='Reveal Options' />

            </Button>
          </div> : ""
        }

        {/* Question Display */}
        {
          state != "leaderboard-revealed" && state != "over-all-leaderboard" && state != "finished" ?
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-lg p-8 border border-orange-100 w-full">

              <div className="text-center mb-6">
                <div className='flex justify-center items-center mb-4'>
                  <div className="bg-orange-500 text-white text-[8rem] font-bold rounded-full w-fit h-fit px-20 flex items-center justify-center shadow-md">
                    {seconds}
                  </div>
                </div>

                <p className="text-[8rem] text-gray-800 font-medium mb-6 capitalize ">{currentQuestion ? currentQuestion['question'] : ""} ? </p>
              </div>
              <div className="text-center">
                <span className="inline-block bg-orange-100 px-6 py-2 rounded-full text-sm font-semibold text-orange-800 shadow-sm">

                  <b className=' mr-1 uppercase'>({currentQuestion ? currentQuestion['difficulty'] : ""})</b>
                  Question {" " + itemNumber + " "}  of {items as number}
                </span>
              </div>
            </div> : ""
        }


        {/* Answer Options */}

        {
          state == "options-revealed" || state == "timer-started" || state == "answer-revealed" && auth.user || state == "" && auth.user || options_revealed == 1 && state != "answer-revealed" && selectedOption != null ?
            <div className="grid grid-cols-2 gap-6 mt-6 justify-center relative w-full">

              {currentQuestion && currentQuestion["options"] && (() => {
                try {
                  const options = JSON.parse(currentQuestion["options"]);
                  return options.map((option: any, index: number) => {
                    const isSelected = selectedOption?.text === option.text;
                    const isDisabled = !(state == "timer-started" && seconds > 0);
                    return (
                      <Button
                        disabled={isDisabled}
                        key={index}
                        onClick={() => submitAnswer(option)}
                        className={`
                  ${isSelected ? 'bg-green-600 shadow-orange-200' : isDisabled ? 'bg-orange-300' : 'bg-orange-500 hover:bg-orange-600'}
                  text-white  rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-center text-4xl capitalize font-medium p-10
                  ${isDisabled ? 'cursor-not-allowed opacity-75' : 'hover:scale-102'}
                  w-full break-words whitespace-normal
                `}
                      >
                        {option.text}

                      </Button>

                    );
                  });
                } catch (error) {
                  const isDisabled = !(state == "timer-started" && seconds > 0);
                  if (currentQuestion["type"] == "true-false") {

                    return <RadioGroup onValueChange={(value) => submitAnswer(value)} className='flex p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 w-[100%]'>

                      <div className="flex items-center justify-center flex-1 space-x-3 w-full">
                        <RadioGroupItem
                          disabled={isDisabled}

                          value="true"
                          id="option-one"
                          className="border-orange-400 text-orange-600 focus:ring-orange-400 h-8 w-8"
                        />
                        <Label htmlFor="option-one" className="text-4xl font-medium text-orange-700 cursor-pointer hover:text-orange-600 transition-colors">TRUE</Label>
                      </div>
                      <div className="flex items-center justify-center flex-1 space-x-3">
                        <RadioGroupItem
                          disabled={isDisabled}
                          value="false"
                          id="option-two"
                          className="border-orange-400 text-orange-600 focus:ring-orange-400 h-8 w-8"
                        />
                        <Label htmlFor="option-two" className="text-4xl font-medium text-orange-700 cursor-pointer hover:text-orange-600 transition-colors">FALSE</Label>
                      </div>
                    </RadioGroup>;

                  } else {
                    return <div className='absolute w-full p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 flex gap-y-4 flex-col'>
                      <Input
                        disabled={shortAnswerSubmitted || state == 'timer-started' ? false : true}
                        value={selectedOption}
                        onChange={({ target }) => setSelectedOption(target.value)}
                        placeholder='Enter your answer'
                        className='border-orange-200 focus:border-orange-500 focus:ring-orange-500 text-lg'
                      />
                      <Button
                        onClick={() => { submitAnswer(selectedOption); setShortAnswerSubmitted(true) }}

                        disabled={shortAnswerSubmitted || state == 'timer-started' ? false : true}
                        className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300'
                      >
                        Submit Answer
                      </Button>
                    </div>

                      ;
                  }

                }
              })()}

            </div> : ""
        }

        {
          state == "answer-revealed" && !auth.user ?
            <div className="grid grid-cols-2 gap-6 mt-6 w-full">
              {
                currentQuestion ?
                  JSON.parse(currentQuestion["options"])?.map((option: any, index: number) => (
                    <div
                      key={index}
                      className={`transform transition-all duration-300 ${option.isCorrect ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                      style={{ display: option.isCorrect ? "block" : "none" }}
                    >
                      <div className="bg-green-500 text-white p-8 rounded-xl shadow-lg flex items-center justify-center">
                        <div className='flex gap-x-3 '>
                          <div className="flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium">{option.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                  : ""
              }

              {selectedOption && !selectedOption.isCorrect && currentQuestion['type'] == 'multiple-choice' ? (
                <div className="transform transition-all duration-300 scale-100 opacity-100">
                  <div className="bg-red-600 text-white p-8 rounded-xl shadow-lg flex items-center justify-center">
                    <div className='flex gap-x-3 '>
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {/* <NotepadTextDashed /> */}
                      </div>
                      <p className="text-lg font-medium">
                        {selectedOption.text}
                      </p>
                    </div>
                  </div>
                </div>
              ) : ""}
              {selectedOption && currentQuestion['type'] == 'short-answer' ? (
                <div className="transform transition-all duration-300 scale-100 opacity-100">
                  <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg flex items-center justify-center">
                    <div className='flex gap-x-3 '>
                      <div className="flex items-center justify-center mb-2">
                        {/* <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg> */}
                        <NotepadTextDashed />
                      </div>
                      <p className="text-lg font-medium">{selectedOption}</p>
                    </div>
                  </div>
                </div>
              ) : ""}
              {selectedOption == "true" || selectedOption == "false" ? (
                <div className='transform transition-all duration-300 scale-100 opacity-100'>
                  <div className={`${selectedOption == "true" && currentQuestion['trueFalseAnswer'] == "1" ||
                    selectedOption == "false" && currentQuestion['trueFalseAnswer'] == "0"
                    ? 'bg-green-500' : 'bg-red-500'} text-white p-8 rounded-xl shadow-lg flex items-center justify-center `}>
                    {/* <div className="bg-orange-600 text-white p-8 rounded-xl shadow-lg flex items-center justify-center"> */}
                    <div className='flex gap-x-3 '>
                      <div className="flex items-center justify-center mb-2">
                        {selectedOption == "true" && currentQuestion['trueFalseAnswer'] == "1" || selectedOption == "false" && currentQuestion['trueFalseAnswer'] == "0" ? <CheckIcon /> : <X />}
                      </div>
                      <p className="text-lg font-medium">{selectedOption}</p>
                    </div>

                  </div>
                </div>

              ) : ""}
            </div> : ""
        }


        {/* LEADERBOARD */}
        {state == "leaderboard-revealed" || state == "finished" || state == "over-all-leaderboard" ?
          <div className="mt-8 bg-gradient-to-br from-orange-50 to-orange-100 w-full p-6 rounded-xl shadow-lg border border-red-500">
            {
              state != "over-all-leaderboard" ?
                <div className='flex items-center gap-x-4'>
                  <TrophyIcon className='text-orange-700 w-10 h-5' />
                  <h1 className='text-orange-700 font-semibold text-[2rem]'>Question {"" + itemNumber + ""}  Leaderboard <b className=' mr-1 uppercase'>({currentQuestion ? currentQuestion['difficulty'] : ""})</b> </h1>
                </div> : ""
            }

            <Table className="border-separate border-spacing-y-3">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4 text-orange-700 font-semibold">Rank & Team</TableHead>

                  {
                    state == "finished" || state != "over-all-leaderboard" ?
                      <TableHead className="w-1/2 text-orange-700 font-semibold">Previous Answer</TableHead> : ""
                  }

                  <TableHead className="w-1/2 text-orange-700 font-semibold">Total Points</TableHead>
                  <TableHead className="w-1/4 text-orange-700 font-semibold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* {JSON.stringify(leaderboard)} */}
                {leaderboard.map((rank, index) => (
                  <TableRow key={rank.rank} className={`${rank.id == team_id ? "bg-orange-500/50 rounded-md hover:bg-orange-500/50" : "hover:bg-orange-200/50"}  transition-colors duration-200`}>
                    <TableCell className="font-medium">
                      <div className='flex items-center gap-x-4'>
                        <div className="text-xl font-bold py-2 px-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md shadow-orange-200">
                          <span className='text-white'>{index + 1}</span>
                        </div>
                        <div className="text-xl font-bold py-2 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-orange-900">{rank.team}</span>
                        </div>
                      </div>
                    </TableCell>

                    {
                      state == "finished" || state != "over-all-leaderboard" ?
                        <TableCell>
                          <div className="text-xl font-bold py-2 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-orange-900">
                            {rank.prev_answer || "--"}
                          </div>
                        </TableCell> : ""
                    }

                    <TableCell>

                      <div className="text-xl font-bold py-2 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-orange-900">
                        {
                          rank.prev_answer_correct == 1 ?
                            state != "over-all-leaderboard" ? currentQuestion ? currentQuestion['points'] : "" : rank.score <= 0 ? 0 : rank.score :
                            state != "over-all-leaderboard" ? 0 : rank.score
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`text-xl font-bold py-2 px-4 ${rank.prev_answer_correct == 1 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-600 to-orange-700'} rounded-lg shadow-md ${rank.prev_answer_correct == 1 ? 'shadow-green-200' : 'shadow-orange-200'}`}>
                        <div className='flex gap-x-2 items-center justify-center text-white'>
                          {rank.prev_answer_correct == 1 ? (
                            <>
                              <CheckCheckIcon className="h-5 w-5" />
                              <span>Correct</span>
                            </>
                          ) : (
                            rank.prev_answer?.trim() == "--" || rank.prev_answer?.trim() == "" ? <>
                              <X className="h-5 w-5" />
                              <span className='text-center'>No Answer</span>
                            </> :
                              <>
                                <X className="h-5 w-5" />
                                <span>Incorrect</span>
                              </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          : ""
        }



        {/* state == "finished" && auth?.user || itemNumber == items && auth?.user && state != "" && !e_state.includes(state)  */}
        {
          auth?.user && state == "finished" || itemNumber == items && auth?.user && state == "over-all-leaderboard" && !e_state.includes(state) ?
            <div className=' w-full flex justify-center'>
              {/* 
          <Button onClick={() => handleGenerateReport()}>
            <PrinterIcon />
            Print Event Results</Button> */}
              <Button className="bg-orange-600 hover:bg-orange-600/65 text-white text-2xl px-14 h-14" onClick={handleGenerateReport} disabled={savingShortAns}>
                {savingShortAns ? 'Generating Report...' : 'Generate Excel Report'}
              </Button>
            </div> : ""
        }

      </div>


      {
        state == "answer-revealed" && !auth.user && currentQuestion['type'] != 'short-answer' ?
          currentQuestion['type'] == 'true-false' ?
            <div className={`${selectedOption == "true" && currentQuestion['trueFalseAnswer'] == "1"
              || selectedOption == "false" && currentQuestion['trueFalseAnswer'] == "0"
              ? 'bg-green-500' : 'bg-red-500'} text-center text-white flex items-center justify-center gap-x-3 p-2 rounded-md absolute bottom-0 w-full`}>


              {selectedOption == "true" && currentQuestion['trueFalseAnswer'] == "1"
                || selectedOption == "false" && currentQuestion['trueFalseAnswer'] == "0"
                ? <CheckIcon /> : <X />}


              <p>
                {selectedOption == "true" && currentQuestion['trueFalseAnswer'] == "1"
                  || selectedOption == "false" && currentQuestion['trueFalseAnswer'] == "0"
                  ? 'Correct' : 'Incorrect'}

              </p>

            </div> :
            <div className={`${selectedOption?.isCorrect == true ? 'bg-green-500' : 'bg-red-500'} text-center text-white flex items-center justify-center gap-x-3 p-2 rounded-md absolute bottom-0 w-full`}>

              {selectedOption?.isCorrect == true ? <CheckIcon /> : <X />}


              <p>
                {selectedOption?.isCorrect == true ? 'Correct' : !selectedOption ? 'No Answer' : 'Incorrect'}

              </p>

            </div> : ""
      }

      {
        state == "answer-revealed" && !auth.user && currentQuestion['type'] == 'short-answer' ?
          <div className='bg-blue-500 text-center text-white flex items-center justify-center gap-x-3 p-2 rounded-md absolute bottom-0 w-full'>
            <p>Result will be out on the leaderboard</p>
          </div> : ""
      }


    </div >
  )
}

export default Questionnaire