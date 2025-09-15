<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subjects extends Model
{
    //   
     protected $fillable = [
        'subject_name',
        'lobby_id',
        'quiz_title',
        'current_level'
 
    ];
  
    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function subjectsQuestions()
    {
        return $this->hasMany(SubjectQuestion::class,"subject_id")->where("deleted",0)->orderBy("id", "asc");
    }
}
