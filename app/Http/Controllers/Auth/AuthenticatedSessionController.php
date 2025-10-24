<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\SessionLogs;
use DateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $user = Auth::user();

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'auth' => [
                'user' => $user,
                'role' => $user ? $user->role : null,
            ],
        ]);
    }


    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();
        session(['role' => $user->role]);

        return redirect()->intended(route('dashboard', absolute: false));
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $log = SessionLogs::where('user_id', Auth::id())
            ->whereNull('logout_timestamp')
            ->first();

        if (!$log) {
            dd('No session found for this user without a logout_timestamp');
        }
        $log->logout_timestamp = Carbon::now('Asia/Manila');
        $log->save();
        // SessionLogs::where('user_id', Auth::id())
        //     ->whereNull('logout_timestamp')
        //     ->update([
        //         'logout_timestamp' => Carbon::now('Asia/Manila'),
        //     ]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
