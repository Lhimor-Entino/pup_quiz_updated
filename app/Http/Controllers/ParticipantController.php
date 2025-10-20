<?php

namespace App\Http\Controllers;

use App\Mail\EventInvitationMail;
use App\Models\Lobby;
use App\Models\Participants;
use App\Models\PointsHistory;
use App\Models\PreRegistration;
use App\Models\SubjectQuestion;
use App\Models\Subjects;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
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
            // ->where('archive', 1)
            ->where("subject_id", $subject_id)
            ->where("is_approved", "2")
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

    public function managePreRegistration(Request $request)
    {

        try {

            $participant_exist = Participants::find($request->participant_id);

            if (!$participant_exist) {
                return response()->json([
                    'success' => false,
                    'message' => 'Participant not found.',
                ], 404);
            }

            // Example insert (replace with your actual model and logic)
            $participant = PreRegistration::create([
                'status' => $request->status,
                'participant_id' => $request->participant_id,
                'lobby_id' => $request->lobby_id,
                'comment' => $request->comment

            ]);

            $participant = Participants::where("id", $request->participant_id)->first();

            $participant->is_approved = $request->status == 1 ? 1 : 2; // 2 IS APPROVED
            $participant->save();


            $subject = Subjects::where("lobby_id", $request->lobby_id)->first();
            $subject_id =  $participant->subject_id;

            $link = $request->status == 1 ? "#" : url("questionnaire/$request->lobby_id/$request->participant_id/$subject_id");
            $subject = $request->status == 1 ? "We regret to inform you that your registration has been declined." : "Congratulations You're invited for a quiz event";

            Mail::to($participant->team_leader_email)->send(new EventInvitationMail($participant->team, $participant->team_leader_email, $subject, $link));

            // Return success response
            return response()->json([
                'success' => true,
                'message' => $request->status == 1 ?  'Pre-registration rejected!' : 'Pre-registration approved!',
                'data' => $participant,
            ], 201); // 201 = Created
        } catch (\Exception $e) {
            // Return error response if something goes wrong
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong during registration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
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
            ->where("is_approved","2")
            ->get();
        return $teams;
    }

    function moveFileToPublic($file, $folder)
    {
        $fileName = $file->hashName();
        $file->move(public_path("storage/$folder"), $fileName);
        return "$folder/$fileName";
    }

    // public function store(Request $request)
    // {
    //     //

    //     $validator = Validator::make($request->all(), [
    //         // 'team' => 'required|string|max:255',

    //         'validStudentId' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
    //         'signedConsentForm' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
    //         'registrationForm' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'errors' => $validator->errors(),
    //         ], 422);
    //     }

    //     $lobby = Lobby::where("lobby_code", $request->input("lobbyCode"))->first();

    //     $subject = Subjects::where("subject_name", $request->input("subject"))
    //         ->where("lobby_id", $lobby->id)->first();



    //     $id = $lobby->id;
    //     $subject_id = $subject->id;
    //     $team_count = Participants::where("lobby_code", $request->input("lobbyCode"))->count();
    //     $team = "Team " . $team_count + 1;
    //     // Store uploaded files if they exist
    //     $studentIdPath = $request->hasFile('validStudentId')
    //         ? $this->moveFileToPublic($request->file('validStudentId'), 'student_ids')
    //         : null;

    //     $consentFormPath = $request->hasFile('signedConsentForm')
    //         ?  $this->moveFileToPublic($request->file('signedConsentForm'), 'consent_forms')
    //         : null;

    //     $registrationFormPath = $request->hasFile('registrationForm')
    //         ?  $this->moveFileToPublic($request->file('registrationForm'), 'registration_forms')
    //         : null;

    //     // Process members
    //     $membersData = [];

    //     foreach ($request->input('members', []) as $index => $member) {
    //         $memberFiles = [];

    //         if ($request->hasFile("members.$index.studentId")) {
    //             $memberFiles['studentId'] =  $this->moveFileToPublic(
    //                 $request->file("members.$index.studentId"),
    //                 'members/student_ids'
    //             );
    //         }

    //         if ($request->hasFile("members.$index.registrationForm")) {
    //             $memberFiles['registrationForm'] =  $this->moveFileToPublic(
    //                 $request->file("members.$index.registrationForm"),
    //                 'members/registration_forms'
    //             );
    //         }

    //         if ($request->hasFile("members.$index.consentForm")) {
    //             $memberFiles['consentForm'] =  $this->moveFileToPublic(
    //                 $request->file("members.$index.consentForm"),
    //                 'members/consent_forms'
    //             );
    //         }

    //         $membersData[] = [
    //             'name' => $member['name'] ?? '',
    //             'studentNumber' => $member['studentNumber'] ?? '',
    //             'courseYear' => $member['courseYear'] ?? '',
    //             'requirements' => $memberFiles,
    //         ];
    //     }


    //     $user = Participants::create([
    //         // 'team' =>  $team,
    //         'team' => $request->input("teamName"),
    //         'members' => json_encode($membersData), // ✅ with file paths
    //         "lobby_code" => $request->input("lobbyCode"),
    //         "team_leader" => $request->input("team_leader"),
    //         "team_leader_email" => $request->input("team_leader_email"),
    //         "subject_id" =>  $subject_id,
    //         'joined_at' => now()->toDateTimeString(),
    //         "student_number" => $request->input("studentNumber"),
    //         "course_year" => $request->input("courseYear"),
    //         "contact_number" => $request->input("contactNumber"),
    //         "student_id" => $studentIdPath,
    //         "consent_form" => $registrationFormPath,
    //         "registration_form" => $registrationFormPath,
    //     ]);


    //     $team_id = $user->id;
    //     $name =  $team;
    //     $email = $request->team_leader_email;
    //     $subject = "Congratulations You're invited for a quiz event";
    //     $link = url("questionnaire/$id/$team_id/$subject_id");



    //     // Mail::to($email)->send(new EventInvitationMail($name, $email, $subject, $link));


    //     return response()->json([
    //         'message' => 'Student registered successfully',
    //         'user' => $user,
    //         'status' => "ok"
    //     ], 201);
    // }

public function store(Request $request)
{
    try {
        // ✅ 1. Validate input
        $validator = Validator::make($request->all(), [
            'validStudentId' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'signedConsentForm' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'registrationForm' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        // ✅ 2. Find lobby and subject
        $lobby = Lobby::where("lobby_code", $request->input("lobbyCode"))->firstOrFail();
        $subject = Subjects::where("subject_name", $request->input("subject"))
            ->where("lobby_id", $lobby->id)
            ->firstOrFail();

        $id = $lobby->id;
        $subject_id = $subject->id;

        // ✅ 3. Determine team name
        $team_count = Participants::where("lobby_code", $request->input("lobbyCode"))->count();
        $team = "Team " . ($team_count + 1);

        // ✅ 4. Handle file uploads safely
        $studentIdPath = $request->hasFile('validStudentId')
            ? $this->moveFileToPublic($request->file('validStudentId'), 'student_ids')
            : null;

        $consentFormPath = $request->hasFile('signedConsentForm')
            ? $this->moveFileToPublic($request->file('signedConsentForm'), 'consent_forms')
            : null;

        $registrationFormPath = $request->hasFile('registrationForm')
            ? $this->moveFileToPublic($request->file('registrationForm'), 'registration_forms')
            : null;

        // ✅ 5. Process members
        $membersData = [];
        foreach ($request->input('members', []) as $index => $member) {
            $memberFiles = [];

            if ($request->hasFile("members.$index.studentId")) {
                $memberFiles['studentId'] = $this->moveFileToPublic(
                    $request->file("members.$index.studentId"),
                    'members/student_ids'
                );
            }

            if ($request->hasFile("members.$index.registrationForm")) {
                $memberFiles['registrationForm'] = $this->moveFileToPublic(
                    $request->file("members.$index.registrationForm"),
                    'members/registration_forms'
                );
            }

            if ($request->hasFile("members.$index.consentForm")) {
                $memberFiles['consentForm'] = $this->moveFileToPublic(
                    $request->file("members.$index.consentForm"),
                    'members/consent_forms'
                );
            }

            $membersData[] = [
                'name' => $member['name'] ?? '',
                'studentNumber' => $member['studentNumber'] ?? '',
                'courseYear' => $member['courseYear'] ?? '',
                'requirements' => $memberFiles,
            ];
        }

        // ✅ 6. Save participant
        $user = Participants::create([
            'team' => $request->input("teamName") ?? $team,
            'members' => json_encode($membersData),
            "lobby_code" => $request->input("lobbyCode"),
            "team_leader" => $request->input("team_leader"),
            "team_leader_email" => $request->input("team_leader_email"),
            "subject_id" => $subject_id,
            'joined_at' => now()->toDateTimeString(),
            "student_number" => $request->input("studentNumber"),
            "course_year" => $request->input("courseYear"),
            "contact_number" => $request->input("contactNumber"),
            "student_id" => $studentIdPath,
            "consent_form" => $consentFormPath,
            "registration_form" => $registrationFormPath,
        ]);

        // ✅ 7. Prepare email (optional)
        $team_id = $user->id;
        $name = $team;
        $email = $request->team_leader_email;
        $subjectLine = "Congratulations! You're invited for a quiz event";
        $link = url("questionnaire/$id/$team_id/$subject_id");

        // Mail::to($email)->send(new EventInvitationMail($name, $email, $subjectLine, $link));

        // ✅ 8. Return success
        return response()->json([
            'message' => 'Student registered successfully',
            'user' => $user,
            'status' => "ok"
        ], 201);

    } catch (\Exception $e) {
        // 🛑 Catch all runtime errors (DB, file, mail, etc.)
        return response()->json([
            'message' => 'An error occurred while processing your request.',
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile(),
        ], 500);
    }
}

    public function updateScore(string $id, $score, $ans, $question, $lobby_id, $question_id, $q_type, $prev_score_ui, $new_question)
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
        // try {


        //     // 1. Find the participant or fail
        //     $participant = Participants::where("id", $id)->firstOrFail();
        //     $sub_question = SubjectQuestion::where("id", $question_id)->first();
        //     $c_lobby = Lobby::where("id", $lobby_id)->first();
        //     // 2. Add the new score to the existing one
        //     $newScore = $participant->score + $score;
        //     $prev_score = $prev_score_ui == 0 ? $participant->score : $prev_score_ui;
        //     $d = "no";
        //     // if ($c_lobby->question_num == $curr_item) {
        //     if ($participant->prev_answer_correct == 1 && $score <= 0) {

        //         if ($participant->score <= 0) {
        //             $newScore = 0;
        //             $d = "s" . $newScore;
        //             $prev_score = $prev_score_ui;
        //         } else {
        //             $newScore  =  $participant->score  - $sub_question->points;
        //             $d = "swww" . $newScore;
        //             $prev_score =   $prev_score_ui;
        //         }
        //          $prev_score =  $newScore;
        //     } else {
        //         $newScore = $new_question == "yes" ? $score + $prev_score_ui : $participant->score + $score;
        //         $prev_score = $participant->score;
        //         $d = "YEs" . $score;
        //         // dd("Previous Score 1:", $prev_score);

        //     }
        //     // }else{
        //     //       $d = "YEs else" . $newScore;
        //     // }
        //     $prev_ans = $ans;
        //     // 3. Update the score


        //     if ($score >= 0 && $q_type !== "short-answer") {
        //         $participant->score = $newScore;
        //         $prev_score = $newScore;
        //         // dd("Previous Score 2:", $prev_score);

        //     }

        //     // if($score <=0 ){
        //     //       $prev_score = intval($prev_score_ui);
        //     // }
        //     $participant->prev_answer = $prev_ans;
        //     $participant->prev_answer_correct = $score > 0 ? 1 : 0;
        //     //
        //     $participant->save();

        //     // PointsHistory::where("participant_id", $id)
        //     //     ->where("lobby_id", $lobby_id)
        //     //     ->where("question_id", $question_id)
        //     //  ->whereDate("created_at", Carbon::today()) // compares only the date
        //     //     ->delete();
        //     $record = PointsHistory::where("participant_id", $id)
        //         ->where("lobby_id", $lobby_id)
        //         ->where("question_id", $question_id)
        //         ->whereDate("created_at", Carbon::today())
        //         ->first();

        //     if ($record) {
        //         $record->delete();
        //         // optional: return success response
        //     } else {

        //         if ($score >= 0 && $q_type !== "short-answer") {
        //             $participant->score = $newScore;
        //         }
        //     }
        //     $participant->save();
        //     PointsHistory::create([
        //         "points" =>  $score,
        //         "question" =>  $question,
        //         "answer" => $ans,
        //         "participant_id" => $id,
        //         'lobby_id' =>  $lobby_id,
        //         'question_id' => $question_id
        //     ]);


        //     // 4. Optional: return a response
        //     return response()->json([
        //         'message' => 'Score updated successfully.',
        //         'new_score' => $participant->score,
        //         'updated_score' => $newScore,
        //         'prev_score' => $prev_score,
        //         'cl' => $c_lobby->question_num,

        //         '$d' => $d
        //     ]);
        // } catch (QueryException $e) {
        //     // Catch database query errors (SQL, constraint violations, etc.)
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Database error occurred.',
        //         'error' => $e->getMessage(), // optional: remove in production
        //     ], 500);
        // } catch (\Exception $e) {
        //     // Catch any other general errors
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Unexpected error occurred.',
        //         'error' => $e->getMessage(),
        //     ], 500);
        // }
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
