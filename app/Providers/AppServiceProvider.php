<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Auth; // Add this import
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia; // Add this import

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share user and role with Inertia globally
        Inertia::share([
            'auth' => fn () => [
                'user' => Auth::user(),
                'role' => session('role'), // Share the role stored in session
            ],
        ]);

        Vite::prefetch(concurrency: 3);
    }
}
