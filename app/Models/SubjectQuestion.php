<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectQuestion extends Model
{
    //
    protected $fillable = [
        'question',
        "difficulty",
        "answer",
        "type",
        "timeLimit",
        "image",
        "options",
        "points",
        "subject_id",
        'trueFalseAnswer',
        'shortAnswer',
    ];

    public function subject()
    {
        return $this->belongsTo(Subjects::class);
    }
}
