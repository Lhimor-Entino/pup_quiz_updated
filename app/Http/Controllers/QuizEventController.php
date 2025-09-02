<?php

namespace App\Http\Controllers;

use App\Events\QuizEvent;
use App\Models\Lobby;
use App\Models\Participants;
use App\Models\PointsHistory;
use App\Models\SubjectQuestion;
use App\Models\Subjects;
use Illuminate\Http\Request;

class QuizEventController extends Controller
{
    //


    public function closeEvent($id,$subject_id)
    {

        Lobby::where('id', $id)->update([
            'reveal_answer' => 0,
            'started' => 0,
            'finished' => 0,
            'start_timer' => 0,
            'reveal_answer' => 0,
            'reveal_leaderboard' => 0,
            'reveal_options' => 0,
            'question_num' => 1,
            'current_level' => ''
        ]);


        $lobby = Lobby::find($id);

        $subject = Subjects::where("lobby_id", $lobby->id)->first();
     
        if ($subject) {
            
            SubjectQuestion::where('subject_id',$subject_id)->update([
                'archive' => 0
            ]);
        }

        $code = $lobby->lobby_code;
        // SubjectQuestion::where('subject_id', $subject->id)->update([
        //     'archive' => 0
        // ]);
        broadcast(new QuizEvent('event-closed', null, null,  $id, null));
        Participants::where('lobby_code', $code)->update([
            'score' => 0,
            'archive' => 0
            // add more fields as needed
        ]);
        PointsHistory::where('lobby_id', $id)->delete();

        // return response()->json(['status' => 'Options are now shown']);
    }

    // public function startQuiz()
    // {
    //     broadcast(new QuizEvent('start-quiz'));

    //     return response()->json(['status' => 'Options are now shown']);
    // }
}
