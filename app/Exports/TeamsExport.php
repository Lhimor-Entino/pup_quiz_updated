<?php

namespace App\Exports;

use App\Models\Participants;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TeamsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Fetch all teams with their members.
        // Adjust 'members' relationship if it's named differently in your Team model.
        return Participants::all(); // Or Team::with('members')->get(); if members are related
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Team Name',
            'Previous Answer Correct',
            'Members',
            'Score',
            'Lobby Code',
            'Created At',
            'Updated At',
        ];
    }

    /**
     * @param mixed $team
     * @return array
     */
    public function map($team): array
    {
        // Decode the members JSON string into an array of member objects
        $members = json_decode($team->members, true);

        // Extract just the names for the Excel column
        $memberNames = collect($members)->map(function ($member) {
            return $member['name'];
        })->implode(', '); // Join names with a comma and space

        return [
            $team->id,
            $team->team,
            $team->prev_answer_correct,
            $memberNames, // Display comma-separated member names
            $team->score,
            $team->lobby_code,
            $team->created_at,
            $team->updated_at,
        ];
    }
}