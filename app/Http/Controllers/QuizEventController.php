<?php

namespace App\Http\Controllers;

use App\Events\QuizEvent;
use App\Models\LeaderboardLog;
use App\Models\Lobby;
use App\Models\Participants;
use App\Models\PointsHistory;
use App\Models\SubjectQuestion;
use App\Models\Subjects;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuizEventController extends Controller
{
    //


    public function closeEvent(Request $request, $id, $subject_id)
    {
     
        try{

            
        $data = json_decode($request->leaderboard, true);

        $place = 1;
        // foreach ($data as $item) {
        //     LeaderboardLog::create([
        //         'user_id' => Auth::id(),
        //         'participant_id' => $item['id'],
        //         'total_score'   => $item['score'],
        //         'place'       =>  $place,
        //         'subject_id'  => $item['subject_id'],
        //     ]);
        //     $place++;
        // }
//    dd($subject_id);
        Lobby::where('id', $id)->update([
            'reveal_answer' => 0,
            'started' => 0,
            'finished' => 0,
            'start_timer' => 0,
            'reveal_answer' => 0,
            'reveal_leaderboard' => 0,
            'reveal_options' => 0,
            'question_num' => 1,
            'current_level' => '',
            'levels_finished' => ''
        ]);


        $lobby = Lobby::find($id);

        $subject = Subjects::where("lobby_id", $lobby->id)->first();

        if ($subject) {

            SubjectQuestion::where('subject_id', $subject_id)->update([
                'archive' => 0
            ]);
        }

        $code = $lobby->lobby_code;
        // SubjectQuestion::where('subject_id', $subject->id)->update([
        //     'archive' => 0
        // ]);
        broadcast(new QuizEvent('event-closed', null, null,  $id, null));
        // Participants::where('lobby_code', $code)->update([
        //     'score' => 0,
        //     'archive' => 0
        //     // add more fields as needed
        // ]);
        PointsHistory::where('lobby_id', $id)->delete();
   }catch (QueryException $e) {
    // Catch database query errors (SQL, constraint violations, etc.)
    return response()->json([
        'success' => false,
        'message' => 'Database error occurred.',
        'error' => $e->getMessage(), // optional: remove in production
    ], 500);
} catch (\Exception $e) {
    // Catch any other general errors
    return response()->json([
        'success' => false,
        'message' => 'Unexpected error occurred.',
        'error' => $e->getMessage(),
    ], 500);
}
        // return response()->json(['status' => 'Options are now shown']);
    }

    public function clearPrevData($id)
    {
        $lobby = Lobby::find($id);
        $code = $lobby->lobby_code;
        Participants::where('lobby_code', $code)->update([
            'score' => 0,
            'archive' => 0,
             'prev_answer_correct' => 0
            // add more fields as needed
        ]);
    }
}
