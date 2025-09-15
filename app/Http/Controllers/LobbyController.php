<?php

namespace App\Http\Controllers;

use App\Events\QuizEvent;
use App\Models\Lobby;
use App\Models\LoobyManagement;
use App\Models\Subjects;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use League\CommonMark\Delimiter\Bracket;

class LobbyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function changeState($id, $level, $subject_id)
    {
        Lobby::where('id', $id)->update([
            'start_timer' => 1
        ]);
        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions
        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($level) {
            $query->where('difficulty', $level);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();


        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;
        $current_question = $questions->subjectsQuestions[0] ?? null;
        broadcast(new QuizEvent('general', $current_question, $lobby->question_num, $id, $level));

        return 1;
    }

    public function checkCode($code)
    {
        $lobby = Lobby::where('lobby_code', $code)->firstOrFail();

        $subject = Subjects::where('lobby_id', $lobby->id)->get();

        return $subject;
    }



    public function showOverAllLeaderBoard($id, $subject_id)
    {
        Lobby::where('id', $id)->update([
            'start_timer' => 1
        ]);
        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions

        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
            $query->where('difficulty', $lobby->current_level)
                ->where("archive", 0);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();

        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;
        $current_question = $questions->subjectsQuestions[0] ?? null;


        broadcast(new QuizEvent('over-all-leaderboard', $current_question, $lobby->question_num, $id, $lobby->current_level));
    }
    public function getLobby()
    {
        $lobbies = Lobby::where("archive",0)->get();

        return $lobbies;
    }

    public function getOrganizerLobby()
    {


        return Lobby::where('user_id', Auth::user()->id)->where("archive", 0)->get();
    }
    public function lobbyStatus($id)
    {
        return Lobby::where('id', $id)->get();
    }
    public function start($id)
    {
        Lobby::where('id', $id)->update([
            'started' => 1
        ]);
        $lobby = Lobby::find($id);

        broadcast(new QuizEvent('start-quiz', 1, 1, $id, $lobby->current_level));

        return 1;
    }
    public function gameLevel($id, $level, $subject_id)
    {
        $lobby = Lobby::where('id', $id)->update([
            'current_level' => $level,

        ]);
        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions
        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($level) {
            $query->where('difficulty', $level);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();


        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;
        $current_question = $questions->subjectsQuestions[0] ?? null;

        if ($current_question == null) {
            return response()->json([
                "status" => 'error',
                "message" => 'No Question Available'
            ], 404);
        }
        //  dd($current_question);
        broadcast(new QuizEvent('level-changes', $current_question, $lobby->question_num, $id, $level));

        return 1;
    }
    public function startTimer($id, $subject_id)
    {
        Lobby::where('id', $id)->update([
            'start_timer' => 1
        ]);
        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions

        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
            $query->where('difficulty', $lobby->current_level)
                ->where("archive", 0);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();

        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;
        $current_question = $questions->subjectsQuestions[0] ?? $questions->subjectsQuestions[0];

        // Broadcast the current question
        broadcast(new QuizEvent('timer-started', $current_question, $lobby->question_num, $id, $lobby->current_level));

        return 1;
    }
    public function revealOptions($id, $subject_id)
    {


        // First, update the lobby, then retrieve it
        Lobby::where('id', $id)->update([
            'reveal_options' => 1
        ]);

        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions

        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
            $query->where('difficulty', $lobby->current_level)
                ->where("archive", 0);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();

        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;

        $current_question = $questions->subjectsQuestions[0] ?? $questions->subjectsQuestions[0];

        // Broadcast the current question
        broadcast(new QuizEvent('options-revealed', $current_question, $lobby->question_num, $id, $lobby->current_level));

        return 1;
    }
    public function revealAnswer($id, $subject_id)
    {
        Lobby::where('id', $id)->update([
            'reveal_answer' => 1
        ]);

        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions

        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
            $query->where('difficulty', $lobby->current_level)
                ->where("archive", 0);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();

        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;
        $current_question = $questions->subjectsQuestions[0] ?? $questions->subjectsQuestions[0];

        // Broadcast the current question
        broadcast(new QuizEvent('answer-revealed', $current_question, $lobby->question_num, $id, $lobby->current_level));

        return 1;
    }
    public function revealLeaderboard($id, $subject_id, $items)
    {
        Lobby::where('id', $id)->update([
            'reveal_leaderboard' => 1
        ]);
        // Fetch the lobby again to get the updated model
        $lobby = Lobby::findOrFail($id);

        // Load questions

        $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
            $query->where('difficulty', $lobby->current_level)
                ->where("archive", 0);
        }])
            ->where('id', $subject_id)
            ->firstOrFail();

        // Use question_num to get current question (1-based index -> 0-based array)
        $current_question_index = $lobby->question_num - 1;
        $current_question = $questions->subjectsQuestions[0] ?? null;

        // Broadcast the current question

        if ($items == $lobby->question_num) {
            broadcast(new QuizEvent('finished', $current_question, $lobby->question_num, $id, $lobby->current_level));
            Lobby::where('id', $id)->update([
                'finished' => 1
            ]);
        } else {
            broadcast(new QuizEvent('leaderboard-revealed', $current_question, $lobby->question_num, $id, $lobby->current_level));
        }


        return 1;
    }
    public function getNewLevel($id)
    {
        $lobby = Lobby::findOrFail($id);

        return response()->json([
            'level' => $lobby->levels_finished,
        ], 200);
    }
    public function nextquestion($id, $subject_id)
    {
        DB::transaction(function () use ($id, $subject_id) {

            $lobby = Lobby::findOrFail($id);
            $next = $lobby->question_num + 1;
            // Update the question number
            $updated = Lobby::where('id', $id)->update([
                'question_num' => $next
            ]);

            // Only proceed if update was successful (i.e., affected 1 or more rows)
            if ($updated) {
                Lobby::where('id', $id)->update([
                    'start_timer' => '0',
                    'reveal_answer' => '0',
                    'reveal_leaderboard' => '0',
                    'reveal_options' => '0'
                ]);

                // Load questions

                $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
                    $query->where('difficulty', $lobby->current_level)
                        ->where("archive", 0);
                }])
                    ->where('id', $subject_id)
                    ->firstOrFail();
                // Use question_num to get current question (1-based index -> 0-based array)
                $current_question_index = $next - 1;
                $current_question = $questions->subjectsQuestions[0] ?? null;


                if ($current_question == null) {
                    Lobby::where('id', $id)->update([
                        'levels_finished' => $lobby->levels_finished . '-' . $lobby->current_level  . '-',
                    ]);

                    broadcast(new QuizEvent('switch-new-level', null, null, $id, $lobby->current_level));
                } else {
                    broadcast(new QuizEvent('', $current_question, $next, $id, $lobby->current_level));
                }
                // $current_question = $questions->subjectsQuestions ?? null;
                // dd($current_question);
                // Broadcast the current question

            } else {
                throw new \Exception("Failed to update question number for lobby ID: $id");
            }
        });
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $lobby = Lobby::create([
            'name' => $request->input('name'),
            'lobby_code' => $request->input('code'),
            'user_id' => Auth::user()->id
        ]);

        LoobyManagement::create([
            "user_id" => Auth::id(),
            "lobby_id" => $lobby->id,
            "action" => 0
        ]);

        return Inertia::render('OrganizerLobby', [
            'lobby' => Lobby::where("user_id", Auth::user()->id)->where("archive",0)->get()
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        //
        $lobby = Lobby::findOrFail($id);

        $lobby->name = $request->name;
        $lobby->lobby_code = $request->code;

        $lobby->save();

        LoobyManagement::create([
            "user_id" => Auth::id(),
            "lobby_id" => $lobby->id,
            "action" => 1
        ]);
        return redirect()->route('organizerLobby')
            ->with('success', 'Lobby Updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {


        $lobby = Lobby::findOrFail($id);
        LoobyManagement::create([
            "user_id" => Auth::id(),
            "lobby_id" => $lobby->id,
            "action" => 2
        ]);


        $lobby->archive = 1;
        $lobby->save();

        // return redirect()->route('organizerLobby')
        //     ->with('success', 'Lobby deleted successfully');
        return Inertia::render('OrganizerLobby', [
            'lobby' => Lobby::where("user_id", Auth::user()->id)->where("archive",0)->get()
        ]);
        //
    }
}
