<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\LiveSession;
use App\Models\LiveParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LiveQuizSessionController extends Controller
{
    public function getSessionState(Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->first();

        if (!$liveSession) {
            return response()->json(['message' => 'Live session not found.'], 404);
        }

        return response()->json($liveSession);
    }

    public function createSession(Request $request, Quiz $quiz)
    {
        if (LiveSession::where('quiz_id', $quiz->id)->exists()) {
            return response()->json(['message' => 'Session already exists for this quiz.'], 409);
        }

        if (Auth::id() !== $quiz->user_id) {
            return response()->json(['message' => 'You are not authorized to create a session for this quiz.'], 403);
        }

        $request->validate([
            'current_question_index' => 'required|integer|min:0',
            'show_answer' => 'required|boolean',
            'status' => 'required|in:waiting,active,finished',
        ]);

        $liveSession = LiveSession::create([
            'quiz_id' => $quiz->id,
            'current_question_index' => $request->current_question_index,
            'show_answer' => $request->show_answer,
            'status' => $request->status,
            'session_host_id' => Auth::id(),
        ]);

        return response()->json($liveSession, 201);
    }

    public function startQuiz(Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->firstOrFail();

        if (Auth::id() !== $liveSession->session_host_id) {
            return response()->json(['message' => 'You are not authorized to start this session.'], 403);
        }

        if ($liveSession->status === 'active') {
            return response()->json(['message' => 'Quiz is already active.'], 409);
        }

        $liveSession->update([
            'status' => 'active',
            'current_question_index' => 0,
            'show_answer' => false,
        ]);

        return response()->json($liveSession);
    }

    public function nextQuestion(Request $request, Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->firstOrFail();

        if (Auth::id() !== $liveSession->session_host_id) {
            return response()->json(['message' => 'You are not authorized to advance questions in this session.'], 403);
        }

        if ($liveSession->status !== 'active') {
            return response()->json(['message' => 'Quiz is not active.'], 409);
        }

        $nextIndex = $request->input('next_question_index');

        if ($nextIndex >= count($quiz->questions)) {
            $liveSession->update(['status' => 'finished', 'show_answer' => true]);
            return response()->json($liveSession);
        }

        $liveSession->update([
            'current_question_index' => $nextIndex,
            'show_answer' => false,
        ]);

        return response()->json($liveSession);
    }

    public function revealAnswer(Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->firstOrFail();

        if (Auth::id() !== $liveSession->session_host_id) {
            return response()->json(['message' => 'You are not authorized to reveal answers in this session.'], 403);
        }

        $liveSession->update(['show_answer' => true]);

        return response()->json($liveSession);
    }

    public function endQuiz(Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->firstOrFail();

        if (Auth::id() !== $liveSession->session_host_id) {
            return response()->json(['message' => 'You are not authorized to end this session.'], 403);
        }

        $liveSession->update(['status' => 'finished', 'show_answer' => true]);

        return response()->json($liveSession);
    }

    public function getParticipants(Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->first();

        if (!$liveSession) {
            return response()->json([], 200);
        }

        // The 'answers' attribute is already cast to an array by the LiveParticipant model.
        // No need for json_decode() here.
        $participants = LiveParticipant::where('live_session_id', $liveSession->id)
                            ->with('user')
                            ->get()
                            ->map(function ($participant) {
                                return [
                                    'user_id' => $participant->user_id,
                                    'user_name' => $participant->user->name,
                                    'score' => $participant->score,
                                    'last_answer_time' => $participant->last_answer_time,
                                    'answers' => $participant->answers ?? [], // Access as array directly
                                ];
                            });

        return response()->json($participants);
    }

    public function joinParticipant(Request $request, Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->first();

        if (!$liveSession) {
            return response()->json(['message' => 'Live session is not active for this quiz.'], 404);
        }

        $participant = LiveParticipant::firstOrCreate(
            [
                'live_session_id' => $liveSession->id,
                'user_id' => Auth::id(),
            ],
            [
                'score' => 0,
                'last_answer_time' => now(),
                'answers' => [], // Initialize with an empty PHP array; model cast handles JSON conversion
            ]
        );

        return response()->json(['message' => 'Successfully joined live session.', 'participant_id' => $participant->id], 200);
    }

    public function submitAnswer(Request $request, Quiz $quiz)
    {
        $liveSession = LiveSession::where('quiz_id', $quiz->id)->firstOrFail();
        $participant = LiveParticipant::where('live_session_id', $liveSession->id)
                                    ->where('user_id', Auth::id())
                                    ->firstOrFail();

        if ($liveSession->status !== 'active' || $liveSession->show_answer) {
            return response()->json(['message' => 'Quiz is not active or answer has been revealed.'], 409);
        }

        $currentQuestion = $quiz->questions()->find($request->input('question_id'));

        if (!$currentQuestion) {
            return response()->json(['message' => 'Question not found.'], 404);
        }

        // Access answers directly as an array thanks to model casting
        $participantAnswers = $participant->answers ?? [];
        if (isset($participantAnswers[$currentQuestion->id])) {
            return response()->json(['message' => 'You have already answered this question.'], 409);
        }

        $isCorrect = false;
        $submittedAnswer = $request->input('answer');

        switch ($currentQuestion->type) {
            case 'multiple-choice':
                $correctOption = $currentQuestion->options->where('is_correct', true)->first();
                if ($correctOption && $submittedAnswer == $correctOption->id) {
                    $isCorrect = true;
                }
                break;
            case 'true-false':
                $submittedBool = filter_var($submittedAnswer, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($submittedBool !== null && $submittedBool === $currentQuestion->true_false_answer) {
                    $isCorrect = true;
                }
                break;
            case 'short-answer':
                if (strtolower($submittedAnswer) === strtolower($currentQuestion->short_answer)) {
                    $isCorrect = true;
                }
                break;
        }

        DB::transaction(function () use ($participant, $currentQuestion, $isCorrect, $submittedAnswer, &$participantAnswers) {
            $pointsAwarded = 0;
            if ($isCorrect) {
                $pointsAwarded = $currentQuestion->points ?? 0;
                $participant->score += $pointsAwarded;
            }
            $participant->last_answer_time = now();

            // Assign the array directly; model cast handles JSON conversion
            $participantAnswers[$currentQuestion->id] = [
                'submitted' => $submittedAnswer,
                'is_correct' => $isCorrect,
                'points_awarded' => $pointsAwarded,
            ];
            $participant->answers = $participantAnswers; // Assign array directly

            $participant->save();
        });

        return response()->json(['message' => 'Answer submitted.', 'is_correct' => $isCorrect, 'score' => $participant->score], 200);
    }

    private function getMimeTypeExtension($mimeType)
    {
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];
        return $mimeMap[$mimeType] ?? null;
    }
}
