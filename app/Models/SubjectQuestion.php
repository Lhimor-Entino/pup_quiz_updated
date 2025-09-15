<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
       public function logs(): HasMany
    {
         return $this->hasMany(QuizManagement::class, 'quiz_id', 'id');
    }
}
