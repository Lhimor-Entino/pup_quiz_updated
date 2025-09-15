<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaderboardLog extends Model
{
    //
    
    use HasFactory;
    public $fillable = ["user_id", "participant_id", "total_score", 'place',"subject_id"];

    public function participant(){
        return $this->belongsTo(Participants::class,'participant_id','id');
    }
}
