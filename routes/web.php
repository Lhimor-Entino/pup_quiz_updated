<?php

use App\Events\QuizEvent;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StudentRegistrationController;
use App\Http\Controllers\MemberRegistrationController;
use App\Http\Controllers\TeacherRegistrationController;
use App\Http\Controllers\OrganizerRegistrationController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\LiveQuizSessionController;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\QuizEventController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SessionLogsController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SubjectQuestionController;
use App\Models\LeaderboardLog;
use App\Models\Lobby;
use App\Models\LoobyManagement;
use App\Models\Participants;
use App\Models\QuizManagement;
use App\Models\SessionLogs;
use App\Models\SubjectQuestion;
use App\Models\Subjects;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
//Registration Controller Routes
Route::post('/register-student', [StudentRegistrationController::class, 'register']);
Route::post('/register-member', [MemberRegistrationController::class, 'register']);
Route::post('/register-teacher', [TeacherRegistrationController::class, 'register']);
Route::post('/register-organizer', [OrganizerRegistrationController::class, 'register']);

//Login Routes
Route::get('/login', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::post('/otp-login', [EmailController::class, 'sendOtp'])->name("otp-login");
Route::post('/resendOTP', [EmailController::class, 'resendOTP']);
Route::post('/verifyOtp', [EmailController::class, 'verifyOtp'])->name("verifyOtp");
//Views Routes
Route::get('/dashboard', function (Request $request) {

    // dd(Auth::id());

    if (Auth::id()) {
        try {
            SessionLogs::create([
                'user_id'    => Auth::id(),
                'ip_address' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            // Log the error for debugging

            // Optionally show it immediately (for local debugging only)
            dd($e->getMessage());
        }
    }


    if (Auth::user()->role == 3) {

        return redirect()->route('organizerLobby');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/explore', function () {
    return Inertia::render('Explore');
})->middleware(['auth', 'verified'])->name('explore');

Route::get('/session-history', function () {

    $logs =  SessionLogs::where("user_id", Auth::id())->get();

    return Inertia::render('SessionHistory', [
        "logs" => $logs
    ]);
})->middleware(['auth', 'verified'])->name('session-history');
Route::get('/lobby-management', function () {

    $logs =  LoobyManagement::with('lobby')->where("user_id", Auth::id())->get();

    return Inertia::render('LobbyManagement', [
        "logs" => $logs
    ]);
})->middleware(['auth', 'verified'])->name('lobby-management');
Route::get('/participant-management', function () {
    return Inertia::render('ParticipantManagement');
})->middleware(['auth', 'verified'])->name('participant-management');
Route::get('/quiz-management', function () {
    $logs =  QuizManagement::with('question')->where("user_id", Auth::id())->get();

    return Inertia::render('QuizManagement', [
        "logs" => $logs
    ]);
})->middleware(['auth', 'verified'])->name('quiz-management');

Route::get('/getLobbyCategory', function () {

    $lobbies = Lobby::with('subjects')->where("user_id", Auth::id())->get();

    // $lobbies = Lobby::with('subjects')
    //     ->where('lobby_code', $lobbyCode)
    //     ->where('archive', 0)
    //     ->get();

    // // $controller = app(QuizEventController::class);
    // // $state = $controller->closeEvent($lobbies[0]->id,0);
    return response()->json(
        [
            "lobbies" => $lobbies
        ]

    );
})->name('getLobbyCategory');

Route::get('/getLobbySubjects/{lobby_id}', function ($lobby_id) {

    $subjects = Subjects::where('lobby_id', $lobby_id)
        ->where('archive', 0)
        ->get();
    return response()->json(
        [
            "subjects" => $subjects
        ]

    );
})->name('getLobbySubjects');


Route::get('/scoring', function () {
    $logs =  LeaderboardLog::with('participant')->where("user_id", Auth::id())->get();
    return Inertia::render('Scoring', [
        "logs" => $logs
    ]);
})->middleware(['auth', 'verified'])->name('scoring');

Route::get('/', function () {

    return Inertia::render('Home');
})->name('home');
Route::get('/teacher', function () {
    return Inertia::render('Teacher');
})->name('teacher');
Route::get('/quizLobby', function () {
    return Inertia::render('QuizLobby');
})->name('quizLobby');
Route::get('/student', function () {
    return Inertia::render('Student');
})->name('student');

Route::get('/participant', function () {
    return Inertia::render('Participant');
})->name('participant');
Route::get('/host', function () {
    return Inertia::render('Host');
})->name('host');
Route::get('/category', function () {
    return Inertia::render('Category');
})->name('category');
// Route::get('/lobby/{id}/{subject_id}/{team_id}', function ($id, $subject_id,$team_id) {
//     $subject = Subjects::where('id', $subject_id)
//     ->get();
//     return Inertia::render('Lobby', ['id' => $id, 'subject_id' => $subject_id, 'subject' => $subject,'team_id'=>$team_id]);
// })->name('lobby');


Route::get('/organizerLobby', function () {
    return Inertia::render('OrganizerLobby');
})->middleware(['auth', 'verified'])->name('organizerLobby');
Route::get('/lobbyCategory/{id}', function ($lobbyCode) {


    $lobbies = Lobby::with('subjects')
        ->where('lobby_code', $lobbyCode)
        ->where('archive', 0)
        ->get();

    // $controller = app(QuizEventController::class);
    // $state = $controller->closeEvent($lobbies[0]->id,0);
    return Inertia::render('LobbyCategory', [
        'lobbies' => $lobbies,
        'id' =>   $lobbies[0]->id
    ]);
})->name('lobbyCategory');



Route::get('/subjectQuestionForm/{subjectId}', function ($subjectId) {


    $questions = Subjects::with('subjectsQuestions')
        ->where('id', $subjectId)
        ->get();

    return Inertia::render('SubjectQuestionForm', [
        'subject_questions' => $questions,
        'subjectId' => $subjectId
    ]);
})->name('subjectQuestionForm');


Route::get('/quizmaster', function () {
    return Inertia::render('QuizMaster');
})->name('quizMaster');
Route::get('/getStarted', function () {
    return Inertia::render('GetStarted');
})->name('getStarted');
Route::get('/organizer', function () {
    return Inertia::render('Organizer');
})->name('organizer');
Route::get('/mylibrary', function () {
    return Inertia::render('MyLibrary');
})->name('mylibrary');
Route::get('/templates', function () {
    return Inertia::render('Templates');
})->name('templates');
Route::get('/createquiz', function () {
    return Inertia::render('CreateQuiz');
})->name('createquiz');
Route::get('/settings', function () {
    return Inertia::render('Settings');
})->name('settings');
Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');
Route::get('/myperformance', function () {
    return Inertia::render('MyPerformance');
})->name('myperformance');
Route::get('/myquizzes', function () {
    return Inertia::render('MyQuizzes');
})->name('myquizzes');
Route::get('/member', function () {
    return Inertia::render('Member');
})->name('member');
Route::get('/chairman', function () {
    return Inertia::render('Chairman');
})->name('chairman');

Route::get('/statistics',  function () {

    $categories =  Subjects::whereHas('lobby', function ($query) {
        $query->where('user_id', Auth::id());
    })->get();
    // $questions = SubjectQuestion::all();
    $questions = $categories->flatMap(function ($subject) {
        return $subject->subjectsQuestions;
    });

    $topLobbyCategory =  DB::table('points_history')
        ->join('subject_questions', 'subject_questions.id', '=', 'points_history.question_id')
        ->join('subjects', 'subjects.id', '=', 'subject_questions.subject_id')
        ->join('lobby', 'lobby.id', '=', 'points_history.lobby_id')
        ->select(
            'lobby.name',
            'subjects.id as subject_id',
            'subjects.subject_name',
            'subject_questions.difficulty',
            DB::raw('SUM(points_history.points) as total_points'),
            DB::raw('COUNT(subject_questions.id) as total_questions')
        )
        ->where('points_history.points', '>', 0)
        ->where('lobby.user_id', Auth::user()->id)
        ->groupBy(
            'subjects.id',
            'subjects.subject_name',
            'lobby.name',
            'subject_questions.difficulty'
        )
        ->orderByDesc('total_points')
        ->limit(1)
        ->first();

    return Inertia::render('QuizStatisticsDashboard', [
        'questions' => $questions,
        'categories' => $categories,
        'topLobbyCategory' => $topLobbyCategory
    ]);
})->name('statistics');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    //Quiz Controllers Routes
    Route::get('/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create');

    Route::post('/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::get('/quizzes/my', [QuizController::class, 'index'])->name('quizzes.my');
    Route::get('/quizzes/myj', [QuizController::class, 'indexj'])->name('quizzes.joined');
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::post('/quizzes/join', [QuizController::class, 'join'])->middleware(['auth', 'verified'])->name('quizzes.join');
    Route::get('/quizzes/{quiz}/edit', [QuizController::class, 'edit'])->name('quizzes.edit');
    Route::post('/quizzes/{quiz}', [QuizController::class, 'update'])->name('quizzes.update');
    Route::get('/quizzes/{quiz}/start', [QuizController::class, 'start'])->name('quizzes.start');
    Route::get('/quizzes/{quiz}/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::get('/quizzes/{quiz}/starting', [QuizController::class, 'starting'])->name('quizzes.starting');
});
Route::post('/question/edit', [QuizController::class, 'updateQuestion'])->name('question.edit');
Route::delete('/question/delete', [QuizController::class, 'deleteQuestion'])->name('question.delete');
Route::get('/quizzes/{quiz}/live', function (App\Models\Quiz $quiz) {
    $quiz->load(['questions.options']);
    return Inertia::render('LiveQuizSession', ['quiz' => $quiz]);
})->name('quizzes.live_session');
require __DIR__ . '/auth.php';

Route::post('/participant', [ParticipantController::class, 'store'])->name('participant');
Route::post('/participant/verify-team', [ParticipantController::class, 'verify'])->name('participant.verify-team');


Route::get('/lobby/{id}/{subject_id}/{team_id?}', function ($id, $subject_id, $team_id = 'organizer') {
    $subject = Subjects::findOrFail($subject_id);

    if ($team_id != "organizer") {

        $team = Participants::findOrFail($team_id);
        $team->subject_id = $subject_id;
        $team->save();
    }


    // $lobby = Lobby::findOrFail($id);
    $lobby = Lobby::where("id", $id)
        ->where("archive", 0)
        ->firstOrFail();

    $current_question = $lobby->question_num;

    if ($lobby->started == 1) {

        if (Auth::user()) {
            broadcast(new QuizEvent('start-quiz', $current_question, $lobby->question_num, $id, $lobby->current_level));
        }

        return redirect()->route('questionnaire', [
            'id' => $id,
            'team_id' => $team_id,
            'subject_id' => $subject_id,

        ]);
    }
    return Inertia::render('Lobby', [
        'id' => $id,
        'subject_id' => $subject_id,
        'subject' => $subject,
        'team_id' => $team_id
    ]);
})->name('lobby');



Route::get('/questionnaire/{id}/{team_id}/{subject_id}', function ($id, $team_id, $subject_id) {



    $subject = Subjects::where("id", $subject_id)->first();
    $now = Carbon::now();
    if ($subject) {
      $start = Carbon::parse($subject->start_date);
        if ($now->lessThan($start)) {
        $diff = $now->diff($start); // DateInterval object

        $days = $diff->d;
        $hours = $diff->h;
        $minutes = $diff->i;

        $message = "Event will start in {$days}d {$hours}h {$minutes}m";

        return Inertia::render("EventReminder", [
            "msg" => $message
        ]);
    }
    }
    // $lobby = Lobby::findOrFail($id);
    $lobby = Lobby::where("id", $id)
        ->where("archive", 0)
        ->firstOrFail();

    $state = null;

    $all_questions = Subjects::with(['subjectsQuestions'])
        ->where('id', $subject_id)
        ->firstOrFail();
    $questions = Subjects::with(['subjectsQuestions' => function ($query) use ($lobby) {
        $query->where('difficulty', $lobby->current_level);
    }])
        ->where('id', $subject_id)
        ->firstOrFail();

    $current_question_index = $lobby->question_num - 1; // assuming 1-based index in DB

    $current_question = $questions->subjectsQuestions[0] ?? null;

    // dd($current_question);
    $items = count($all_questions->subjectsQuestions);


    $itemNumber = $lobby->question_num;
    if ($lobby->started == 0) {

        $subject = Subjects::findOrFail($subject_id);
        return redirect()->route('lobby', [
            'id' => $id,
            'subject_id' => $subject_id,
            'subject' => $subject,
            'team_id' => $team_id

        ]);
    } else {
        if ($team_id != 'organizer') {
            Participants::where('id', $team_id)->update([
                'archive' => 1
            ]);
        }
    }
    if ($lobby->reveal_options == 1) {
        $state = "options-revealed";
    }
    if ($lobby->start_timer == 1) {
        $state = "timer-started";
    }
    if ($lobby->reveal_answer == 1) {
        $state = "answer-revealed";
    }
    if ($lobby->reveal_leaderboard == 1) {
        $state = "leaderboard-revealed";
    }
    if ($lobby->finished == 1) {
        $state = "finished";
    }


    if (Auth::user()) { // ONLY LOGGED IN USER OR ORGANIZER
        broadcast(new QuizEvent($state, $current_question, $itemNumber, $id, $lobby->current_level));
    }

    return Inertia::render(
        'Questionnaire',
        [
            'id' => $id,
            "team_id" => $team_id,
            'subject_id' => $subject_id,
            'quiz_state' => $state,
            'current_question' => $current_question,
            'options_revealed' => $lobby->reveal_options,
            'items' =>  $items,
            'item_number' =>  $itemNumber,
            'current_level' => $lobby->current_level,
            'levels_finished' => $lobby->levels_finished

        ]
    );
})->name('questionnaire');

Route::get('/lobbies', [LobbyController::class, 'getLobby'])->name('lobbies');
Route::get('/lobby-start/{id}', [LobbyController::class, 'start'])->name('lobby-start');
Route::get('/lobby-revealOptions/{id}/{subject_id}', [LobbyController::class, 'revealOptions'])->name('lobby-revealOptions');
Route::get('/lobby-startTimer/{id}/{subject_id}', [LobbyController::class, 'startTimer'])->name('lobby-startTimer');
Route::get('/showOverAllLeaderBoard/{id}/{subject_id}', [LobbyController::class, 'showOverAllLeaderBoard'])->name('showOverAllLeaderBoard');
Route::get('/lobby-gameLevel/{id}/{level}/{subject_id}', [LobbyController::class, 'gameLevel'])->name('lobby-gameLevel');
Route::get('/lobby-changeState/{id}/{level}/{subject_id}', [LobbyController::class, 'changeState'])->name('lobby-changeState');
Route::get('/getLevel/{id}', [LobbyController::class, 'getNewLevel'])->name('getLevel');

Route::get('/lobby-revealAnswer/{id}/{subject_id}', [LobbyController::class, 'revealAnswer'])->name('lobby-revealAnswer');
Route::get('/lobby-nextquestion/{id}/{subject_id}', [LobbyController::class, 'nextquestion'])->name('lobby-nextquestion');
Route::get('/lobby-revealLeaderboard/{id}/{subject_id}/{item_number}', [LobbyController::class, 'revealLeaderboard'])->name('lobby-revealLeaderboard');
Route::post('/lobby', [LobbyController::class, 'store'])->name('lobby.store');
Route::post('/lobby/{id}', [LobbyController::class, 'update'])->name('lobby.update');
Route::post('/lobby/{id}/delete', [LobbyController::class, 'destroy'])->name('lobby.destroy');

Route::post('/close-event/{id}/{subject_id}', [QuizEventController::class, 'closeEvent'])->name('close-event');


Route::post('/subject', [SubjectController::class, 'store'])->name('subject.store');

Route::get('/teams/{id}/{subject_id}', [ParticipantController::class, 'teams'])->name('teams');
Route::get('/check-lobby-code/{code}', [LobbyController::class, 'checkCode'])->name('check-lobby-code');

Route::get('/organizer-lobbies', [LobbyController::class, 'getOrganizerLobby'])->name('organizer-lobbies');
Route::get('/lobby-status/{id}', [LobbyController::class, 'lobbyStatus'])->name('lobbyStatus');
Route::post('/add-subject-quiz', [SubjectQuestionController::class, 'store'])->name('add-subject-quiz');
Route::get('/getLobbyQuestion/{lobby_id}/{subject_id}', [SubjectQuestionController::class, 'getLobbyQuestion'])->name('getLobbyQuestion');
Route::get('/updateScore/{id}/{score}/{ans}/{question}/{lobby_id}/{question_id}/{q_type}', [ParticipantController::class, 'updateScore'])->name('updateScore');
Route::get('/leaderboard/{id}/{subject_id}', [ParticipantController::class, 'leaderboard'])->name('leaderboard');
Route::get('/currentQuestionLeaderboard/{id}/{question_id}', [ParticipantController::class, 'currentQuestionLeaderboard'])->name('currentQuestionLeaderboard');
Route::get('/participant-code-update/{id}/{code}', [ParticipantController::class, 'updateTeamCode'])->name('participant-code-update');
Route::get('/participant-shor-answer/{id}', [ParticipantController::class, 'shortAnswer'])->name('participant-shor-answer');
Route::post('/participant-answer-update', [ParticipantController::class, 'updateAns'])->name('participant-shor-answer');

Route::get('/report/teams/excel/{lobby_id}', [ReportController::class, 'downloadTeamsReport']);



Route::prefix('api/live-quizzes/{quiz}')->middleware('auth:sanctum')->group(function () {
    Route::get('session', [LiveQuizSessionController::class, 'getSessionState']);

    Route::post('create-session', [LiveQuizSessionController::class, 'createSession']);

    Route::post('start-quiz', [LiveQuizSessionController::class, 'startQuiz']);
    Route::post('next-question', [LiveQuizSessionController::class, 'nextQuestion']);
    Route::post('reveal-answer', [LiveQuizSessionController::class, 'revealAnswer']);
    Route::post('end-quiz', [LiveQuizSessionController::class, 'endQuiz']);
    Route::post('join-participant', [LiveQuizSessionController::class, 'joinParticipant']);
    Route::post('submit-answer', [LiveQuizSessionController::class, 'submitAnswer']);
    Route::get('participants', [LiveQuizSessionController::class, 'getParticipants']);
});
