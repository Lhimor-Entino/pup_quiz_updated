<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointsHistory extends Model
{
    //
    protected $table = 'points_history';
    protected $fillable = [
        'points',
        'question',
        'answer',
        'participant_id',
        'lobby_id',
        'question_id'

    ];

    public function question() : BelongsTo{
        return $this->belongsTo(Question::class);
    }
}
