<?php

namespace App\Http\Controllers;

use App\Exports\TeamsExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function downloadTeamsReport($lobby_id,$subjecId)
    {
        $fileName = 'teams_report_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new TeamsExport($lobby_id,$subjecId), $fileName);
    }
}