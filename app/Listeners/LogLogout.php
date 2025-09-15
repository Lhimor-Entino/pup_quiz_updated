<?php

namespace App\Listeners;

use App\Models\SessionLogs;
use Carbon\Carbon;
use Illuminate\Auth\Events\Logout;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogLogout
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        //
        SessionLogs::where('user_id', $event->user->id)
            ->whereNull('logout_timestamp')
            ->update(['logout_timestamp' =>  Carbon::now('Asia/Manila')]);
    }
}
