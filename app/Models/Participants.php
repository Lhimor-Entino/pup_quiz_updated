<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participants extends Model
{
    //

    protected $fillable = [
        'team',
        'members',
        'score',
        'archive',
        'lobby_code',
        'prev_answer',
        'prev_answer_correct',
        "team_leader",
        "team_leader_email",
        "is_online",
        "student_number",
        "course_year",
        "contact_number",
        "student_id",
        "consent_form",
        "registration_form",
    ];

    public function logs()
    {
        return $this->hasMany(LeaderboardLog::class, 'participant_id', 'id');
    }
}
