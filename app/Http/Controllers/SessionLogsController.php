<?php

namespace App\Http\Controllers;

use App\Models\SessionLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionLogsController extends Controller
{
    //

    public function getSessionLogs(){
        SessionLogs::where("user_id",Auth::id());
    }
}
