<?php

namespace App\Http\Controllers;

use App\Mail\EventInvitationMail;
use App\Models\Lobby;
use App\Models\Participants;
use App\Models\PointsHistory;
use App\Models\SubjectQuestion;
use App\Models\Subjects;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ParticipantController extends Controller
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
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function verify(Request $request)
    {
        $name = $request->input("team_name");

        $participant = Participants::where("team", $name)->first();

        return response()->json([
            'exists' => $participant !== null,
            'id' => $participant?->id // Returns null if not found
        ]);
    }

    public function updateTeamCode($id, $code)
    {
        Participants::where('id', $id)->update([
            'lobby_code' => $code
        ]);
    }
    public function updateAns(Request $request)
    {
        // First, update the lobby, then retrieve it

        $participants = json_decode($request->input('participants'));
        foreach ($participants as $item) {

            $participant = Participants::find($item->id); // simpler than where(...)->first()

            $updateData = [
                'prev_answer_correct' => $item->status == "correct" ? 1 : 0,
            ];

            if ($item->status == "correct") {
                $updateData['score'] =  $participant->score + $item->points;
            }

            Participants::where('id', $item->id)->update($updateData);

            if ($item->status == "correct") {
                $updateDataPointHistory['points'] =  $item->points;
            } else {
                $updateDataPointHistory['points'] =  0;
            }
            PointsHistory::where("participant_id", $item->id)->update($updateDataPointHistory);
        }
        return 1;
    }
    public function shortAnswer($id)
    {
        $lobby = Lobby::find($id); // simpler than where(...)->first()

        if (!$lobby) {
            return response()->json(['error' => 'Lobby not found'], 404);
        }

        $participants = Participants::where([
            ['lobby_code', '=', $lobby->lobby_code],
            ['archive', '=', 1],
        ])->get();

        return $participants;
    }
    public function leaderboard($id, $subject_id)
    {

        $lobby  = Lobby::where("id", $id)->first();

        return Participants::where('lobby_code', $lobby->lobby_code)
            ->where('archive', 1)
            ->where("subject_id", $subject_id)
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc') // if scores are tied, earlier entry comes first
            ->get();
    }
    // public function currentQuestionLeaderboard($id, $question_id)
    // {
    //     $subQuery = DB::table('points_history')
    //         ->select(DB::raw('MAX(created_at) as latest_created_at'), 'participant_id')
    //         ->where('lobby_id', $id)
    //         ->where('question_id', $question_id)
    //         ->groupBy('participant_id');

    //     // Join the subquery to get full rows
    //     $history = DB::table('points_history as ph')
    //         ->joinSub($subQuery, 'latest', function ($join) {
    //             $join->on('ph.participant_id', '=', 'latest.participant_id')
    //                 ->on('ph.created_at', '=', 'latest.latest_created_at');
    //         })
    //         ->join('participants as p', 'ph.participant_id', '=', 'p.id') // JOIN with participants
    //         ->where('ph.lobby_id', $id)
    //         ->where('ph.question_id', $question_id)
    //         ->select(
    //             'ph.*',
    //             'p.team as participant_name' // select participant name (or any field you need)
    //         )
    //         ->get();

    //     return $history;
    // }
    public function currentQuestionLeaderboard($id, $question_id)
    {

        SubjectQuestion::where('id', $question_id)->update([
            'archive' => '1',
        ]);

        $subQuery = DB::table('points_history')
            ->select(DB::raw('MAX(created_at) as latest_created_at'), 'participant_id')
            ->where('lobby_id', $id)
            ->where('question_id', $question_id)
            ->groupBy('participant_id');

        $history = DB::table('points_history as ph')
            ->joinSub($subQuery, 'latest', function ($join) {
                $join->on('ph.participant_id', '=', 'latest.participant_id')
                    ->on('ph.created_at', '=', 'latest.latest_created_at');
            })
            ->join('participants as p', 'ph.participant_id', '=', 'p.id')
            ->where('ph.lobby_id', $id)
            ->where('ph.question_id', $question_id)
            ->orderBy('ph.points', 'desc') // ✅ sort by points descending
            ->select(
                'ph.*',
                'p.team as participant_name'
            )
            ->get();

        return $history;
    }
    public function teams($id, $subject_id)
    {
        $lobby =  Lobby::where("id", $id)->first();

        $teams = Participants::where("lobby_code", $lobby->lobby_code)
            ->where("subject_id", $subject_id)
            ->get();
        return $teams;
    }
    public function store(Request $request)
    {
        //

        $validator = Validator::make($request->all(), [
            // 'team' => 'required|string|max:255',
           
            'validStudentId' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'signedConsentForm' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'registrationForm' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $lobby = Lobby::where("lobby_code", $request->input("lobbyCode"))->first();

        $subject = Subjects::where("subject_name", $request->input("subject"))
            ->where("lobby_id", $lobby->id)->first();



        $id = $lobby->id;
        $subject_id = $subject->id;
        $team_count = Participants::where("lobby_code", $request->input("lobbyCode"))->count();
        $team = "Team " . $team_count + 1;
        // Store uploaded files if they exist
        $studentIdPath = $request->hasFile('validStudentId')
            ? $request->file('validStudentId')->store('student_ids', 'public')
            : null;

        $consentFormPath = $request->hasFile('signedConsentForm')
            ? $request->file('signedConsentForm')->store('consent_forms', 'public')
            : null;

        $registrationFormPath = $request->hasFile('registrationForm')
            ? $request->file('registrationForm')->store('registration_forms', 'public')
            : null;

                // 🟩 2. Process members
    $membersData = [];

    foreach ($request->input('members', []) as $index => $member) {
        $memberFiles = [];

        if ($request->hasFile("members.$index.studentId")) {
            $memberFiles['studentId'] = $request->file("members.$index.studentId")
                ->store('members/student_ids', 'public');
        }

        if ($request->hasFile("members.$index.registrationForm")) {
            $memberFiles['registrationForm'] = $request->file("members.$index.registrationForm")
                ->store('members/registration_forms', 'public');
        }

        if ($request->hasFile("members.$index.consentForm")) {
            $memberFiles['consentForm'] = $request->file("members.$index.consentForm")
                ->store('members/consent_forms', 'public');
        }

        $membersData[] = [
            'name' => $member['name'] ?? '',
            'studentNumber' => $member['studentNumber'] ?? '',
            'courseYear' => $member['courseYear'] ?? '',
            'requirements' => $memberFiles,
        ];
    }
        $user = Participants::create([
            'team' =>  $team,
           'members' => json_encode($membersData), // ✅ with file paths
            "lobby_code" => $request->input("lobbyCode"),
            "team_leader" => $request->input("team_leader"),
            "team_leader_email" => $request->input("team_leader_email"),
            "subject_id" => $subject_id,
            'joined_at' => now()->toDateTimeString(),
            "student_number" => $request->input("studentNumber"),
            "course_year" => $request->input("courseYear"),
            "contact_number" => $request->input("contactNumber"),
            "student_id" => $studentIdPath,
            "consent_form" =>$registrationFormPath ,
            "registration_form" => $registrationFormPath,
        ]);


        $team_id = $user->id;
        $name =  $team;
        $email = $request->team_leader_email;
        $subject = "Congratulations You're invited for a quiz event";
        $link = url("questionnaire/$id/$team_id/$subject_id");



        Mail::to($email)->send(new EventInvitationMail($name, $email, $subject, $link));


        return response()->json([
            'message' => 'Student registered successfully',
            'user' => $user,
            'status' => "ok"
        ], 201);
    }


    public function updateScore(string $id, $score, $ans, $question, $lobby_id, $question_id, $q_type)
    {


        // 1. Find the participant or fail
        $participant = Participants::where("id", $id)->firstOrFail();

        // 2. Add the new score to the existing one
        $newScore = $participant->score + $score;
        $prev_ans = $ans;
        // 3. Update the score


        // if ($score >= 0 && $q_type !== "short-answer") {
        //     $participant->score = $newScore;
        // }

        $participant->prev_answer = $prev_ans;
        $participant->prev_answer_correct = $score > 0 ? 1 : 0;
        //
        $participant->save();

        // PointsHistory::where("participant_id", $id)
        //     ->where("lobby_id", $lobby_id)
        //     ->where("question_id", $question_id)
        //  ->whereDate("created_at", Carbon::today()) // compares only the date
        //     ->delete();
        $record = PointsHistory::where("participant_id", $id)
            ->where("lobby_id", $lobby_id)
            ->where("question_id", $question_id)
            ->whereDate("created_at", Carbon::today())
            ->first();

        if ($record) {
            $record->delete();
            // optional: return success response
        } else {

            if ($score >= 0 && $q_type !== "short-answer") {
                $participant->score = $newScore;
            }
        }
        $participant->save();
        PointsHistory::create([
            "points" =>  $score,
            "question" =>  $question,
            "answer" => $ans,
            "participant_id" => $id,
            'lobby_id' =>  $lobby_id,
            'question_id' => $question_id
        ]);


        // 4. Optional: return a response
        return response()->json([
            'message' => 'Score updated successfully.',
            'new_score' => $participant->score,
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
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
