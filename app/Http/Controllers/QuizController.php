<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\Option;
use App\Models\LiveSession; // Import the LiveSession model
use App\Models\LiveParticipant; // Import the LiveParticipant model
use App\Models\SubjectQuestion;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QuizController extends Controller
{

    public function starting(Quiz $quiz)
    {


        $quiz->load('questions.options');

        return Inertia::render('JoinQuizSession', [
            'quiz' => $quiz,
        ]);
    }

    public function index()
    {
        $quizzes = Auth::user()->quizzes()
            ->with(['questions.options'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($quizzes);
    }

    public function indexj()
    {
        $joinedQuizzes = Auth::user()->quizAttempts()
            ->with(['quiz.questions'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($attempt) {
                $quiz = $attempt->quiz;
                $quiz->statusquiz = $attempt->status; // Add the status from QuizAttempt to the quiz object
                return $quiz;
            });

        return response()->json($joinedQuizzes);
    }

    /**
     * Display the specified quiz.
     */
    public function show(Quiz $quiz)
    {
        if (Auth::id() !== $quiz->user_id) {
            abort(403); // Forbidden
        }

        $quiz->load('questions.options');

        return Inertia::render('ShowQuizPage', [
            'quiz' => $quiz,
        ]);
    }

    public function join(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'max:255'],
        ]);

        $quiz = Quiz::where('code', $request->input('code'))->first();

        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found. Please check the code.'], 404);
        }

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Authentication required to join a quiz.'], 401);
        }

        $existingAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existingAttempt) {
            return response()->json([
                'message' => 'You have already joined this quiz.',
                'quiz_id' => $quiz->id
            ], 200);
        }

        QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Successfully joined the quiz!', 'quiz_id' => $quiz->id], 200);
    }

    public function update(Request $request, Quiz $quiz)
    {
        if (Auth::id() !== $quiz->user_id) {
            abort(403, 'You are not authorized to update this quiz.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'questions' => 'required|array',
            'questions.*.id' => 'nullable|integer',
            'questions.*.type' => 'required|in:multiple-choice,true-false,short-answer',
            'questions.*.questionText' => 'required|string',
            'questions.*.timeLimit' => 'nullable|integer|min:1',
            'questions.*.points' => 'nullable|integer|min:1',
            'questions.*.difficulty' => 'required|in:easy,average,hard',
            'questions.*.image' => 'nullable|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*.id' => 'nullable|integer',
            'questions.*.options.*.text' => 'required_if:questions.*.type,multiple-choice|string',
            'questions.*.options.*.isCorrect' => 'boolean',
            'questions.*.trueFalseAnswer' => 'nullable|boolean',
            'questions.*.shortAnswer' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $quiz) {
            $quiz->update(['title' => $request->title]);

            $existingQuestionIds = $quiz->questions->pluck('id')->toArray();
            $submittedQuestionIds = collect($request->questions)->pluck('id')->filter()->toArray();

            $questionsToDelete = array_diff($existingQuestionIds, $submittedQuestionIds);
            Question::whereIn('id', $questionsToDelete)->delete();

            foreach ($request->questions as $questionData) {
                $imagePath = null;

                if (!empty($questionData['image']) && str_starts_with($questionData['image'], 'data:image')) {
                    try {
                        $base64Image = explode(';base64,', $questionData['image']);
                        if (count($base64Image) === 2) {
                            $imageContent = base64_decode($base64Image[1]);
                            $imageMimeType = explode(':', $base64Image[0])[1];
                            $extension = $this->getMimeTypeExtension($imageMimeType);

                            if ($imageContent && $extension) {
                                $fileName = uniqid() . '.' . $extension;
                                Storage::disk('public')->put('quiz_images/' . $fileName, $imageContent);
                                $imagePath = 'quiz_images/' . $fileName;
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::error("Error decoding or storing image for update: " . $e->getMessage());
                    }
                } elseif (!empty($questionData['image'])) {
                    $imagePath = $questionData['image'];
                }

                $questionAttributes = [
                    'type' => $questionData['type'],
                    'question_text' => $questionData['questionText'],
                    'image_path' => $imagePath,
                    'time_limit' => $questionData['timeLimit'] ?? null,
                    'points' => $questionData['points'] ?? null,
                    'difficulty' => $questionData['difficulty'],
                    'true_false_answer' => $questionData['type'] === 'true-false' ? ($questionData['trueFalseAnswer'] ?? null) : null,
                    'short_answer' => $questionData['type'] === 'short-answer' ? ($questionData['shortAnswer'] ?? null) : null,
                ];

                $question = $quiz->questions()->updateOrCreate(
                    ['id' => $questionData['id'] ?? null],
                    $questionAttributes
                );

                if ($questionData['type'] === 'multiple-choice' && !empty($questionData['options'])) {
                    $existingOptionIds = $question->options->pluck('id')->toArray();
                    $submittedOptionIds = collect($questionData['options'])->pluck('id')->filter()->toArray();

                    $optionsToDelete = array_diff($existingOptionIds, $submittedOptionIds);
                    Option::whereIn('id', $optionsToDelete)->delete();

                    foreach ($questionData['options'] as $optionData) {
                        $optionAttributes = [
                            'option_text' => $optionData['text'],
                            'is_correct' => $optionData['isCorrect'] ?? false,
                        ];
                        $question->options()->updateOrCreate(
                            ['id' => $optionData['id'] ?? null],
                            $optionAttributes
                        );
                    }
                } elseif ($questionData['type'] !== 'multiple-choice') {
                    $question->options()->delete();
                }
            }
        });

        return redirect()->back()->with('success', 'Quiz updated successfully!');
    }

    /**
     * Show the form for creating a new quiz.
     */

    public function deleteQuestion(Request $request)
    {

        try {
            // Start database transaction

            SubjectQuestion::where('id', $request->id)->delete();

            return 1;
        } catch (Exception $e) {


            return response()->json([
                'success' => false,
                'message' => 'Failed to update quiz question: ' . $e->getMessage()
            ], 500);
        }
    }
    public function updateQuestion(Request $request)
    {


        try {


            // Start database transaction
            DB::beginTransaction();

            // Find the quiz question
            $quizQuestion = SubjectQuestion::findOrFail($request->id);
              

            $updateData = [
                'question'   => $request->question,
                'difficulty' => $request->difficulty,
                'type'       => $request->type,
                'timeLimit'  => $request->timeLimit,
                'points'     => $request->points,
            ];

            // Only update "options" if type == multiple-choice
            if ($request->type === 'multiple-choice') {
                $updateData['options'] = $request->options;
            }
            if ($request->type === 'true-false') {

                $updateData['trueFalseAnswer'] = $request->trueFalseAnswer ? 1 : 0;
            }
            if ($request->type === 'short-answer') {

                $updateData['shortAnswer'] = $request->shortAnswer;
            }

            $quizQuestion->update($updateData);
            // Commit the transaction
            DB::commit();
            return 1;
            // return redirect()->route('subjectQuestionForm', ['subjectId' => $quizQuestion->subject_id]);
        } catch (Exception $e) {
            // Rollback the transaction
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update quiz question: ' . $e->getMessage()
            ], 500);
        }
    }
    public function create()
    {
        return Inertia::render('CreateQuizPage');
    }

    public function edit(Quiz $quiz)
    {
        if (Auth::id() !== $quiz->user_id) {
            abort(403, 'You are not authorized to edit this quiz.');
        }

        $quiz->load('questions.options');

        return Inertia::render('EditQuizPage', [
            'quiz' => $quiz,
        ]);
    }

    public function start(Quiz $quiz)
    {
        // Only the quiz creator can "start" the live session from this route
        if (Auth::id() !== $quiz->user_id) {
            abort(403, 'You are not authorized to start this live session.');
        }

        DB::transaction(function () use ($quiz) {
            // Find or create the LiveSession for this quiz
            $liveSession = LiveSession::firstOrCreate(
                ['quiz_id' => $quiz->id],
                [
                    'current_question_index' => 0,
                    'show_answer' => false,
                    'status' => 'waiting', // Start as waiting, host can click 'Start Quiz'
                    'session_host_id' => Auth::id(),
                ]
            );

            // If the session was just created, or if it was finished/waiting, activate it and reset
            if ($liveSession->wasRecentlyCreated || $liveSession->status === 'waiting' || $liveSession->status === 'finished') {
                $liveSession->update([
                    'status' => 'active',
                    'current_question_index' => 0,
                    'show_answer' => false,
                ]);
            }

            // Register the host as a participant in the live session
            LiveParticipant::updateOrCreate(
                [
                    'live_session_id' => $liveSession->id,
                    'user_id' => Auth::id(),
                ],
                [
                    'score' => 0,
                    'last_answer_time' => now(),
                ]
            );
        });

        // Redirect the host to the live session view
        return redirect()->route('quizzes.live_session', $quiz->id);
    }

    /**
     * Store a newly created quiz in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'questions' => 'required|array',
            'questions.*.type' => 'required|in:multiple-choice,true-false,short-answer',
            'questions.*.questionText' => 'required|string',
            'questions.*.timeLimit' => 'nullable|integer|min:1',
            'questions.*.points' => 'nullable|integer|min:1',
            'questions.*.difficulty' => 'required|in:easy,average,hard',
            'questions.*.image' => 'nullable|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*.text' => 'required_if:questions.*.type,multiple-choice|string',
            'questions.*.options.*.isCorrect' => 'boolean',
            'questions.*.trueFalseAnswer' => 'nullable|boolean',
            'questions.*.shortAnswer' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            do {
                $quizCode = mt_rand(10000000, 99999999);
            } while (Quiz::where('code', $quizCode)->exists());

            $quiz = Quiz::create([
                'title' => $request->title,
                'user_id' => Auth::id(),
                'code' => $quizCode,
                'status' => 'published', // New quizzes are typically drafts by default
            ]);

            foreach ($request->questions as $questionData) {
                $imagePath = null;
                if (!empty($questionData['image'])) {
                    try {
                        $base64Image = explode(';base64,', $questionData['image']);
                        if (count($base64Image) === 2) {
                            $imageContent = base64_decode($base64Image[1]);
                            $imageMimeType = explode(':', $base64Image[0])[1];
                            $extension = $this->getMimeTypeExtension($imageMimeType);

                            if ($imageContent && $extension) {
                                $fileName = uniqid() . '.' . $extension;
                                Storage::disk('public')->put('quiz_images/' . $fileName, $imageContent);
                                $imagePath = 'quiz_images/' . $fileName;
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::error("Error decoding or storing image: " . $e->getMessage());
                    }
                }

                $question = $quiz->questions()->create([
                    'type' => $questionData['type'],
                    'question_text' => $questionData['questionText'],
                    'image_path' => $imagePath,
                    'time_limit' => $questionData['timeLimit'] ?? null,
                    'points' => $questionData['points'] ?? null,
                    'difficulty' => $questionData['difficulty'],
                    'true_false_answer' => $questionData['type'] === 'true-false' ? ($questionData['trueFalseAnswer'] ?? null) : null,
                    'short_answer' => $questionData['type'] === 'short-answer' ? ($questionData['shortAnswer'] ?? null) : null,
                ]);

                if ($questionData['type'] === 'multiple-choice' && !empty($questionData['options'])) {
                    foreach ($questionData['options'] as $optionData) {
                        $question->options()->create([
                            'option_text' => $optionData['text'],
                            'is_correct' => $optionData['isCorrect'] ?? false,
                        ]);
                    }
                }
            }
        });

        return redirect()->back()
            ->with('success', 'Quiz created successfully!');
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
