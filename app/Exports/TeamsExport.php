<?php

namespace App\Exports;

use App\Models\Lobby;
use App\Models\Participants;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TeamsExport implements FromCollection, WithHeadings, WithMapping
{

    private $rankCounter = 0; // keep track of ranks
    private $lobbyId;
    private $event;
    public function __construct($lobbyId)
    {
        $this->lobbyId = $lobbyId;
    }
    /**
     * 
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $lobby = Lobby::where('id', $this->lobbyId)->first();
        $this->event = $lobby->name;
        return Participants::where("lobby_code", $lobby->lobby_code)
        ->where("archive",1)
            ->orderBy('score', 'desc')
            ->get(); // Or Team::with('members')->get(); if members are related
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Quiz Event',
            'Lobby Code',
            'Rank',
            'Team Name',
            'Participants Score',
            'Date & Time of Quiz',

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
        // Increment rank counter each time map() is called
        $this->rankCounter++;


        return [
            $this->event,
            $team->lobby_code,
            $this->rankCounter,
            $team->team,
            $team->score == 0 ? "0" : $team->score,
            $team->updated_at,
        ];
    }
}
