<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizManagement extends Model
{
    //
    protected $table = 'quiz_mngnt'; // if your table is not pluralized
    use HasFactory;
    public $fillable = ["user_id", "quiz_id", "action"];

    public function question()
    {
        return $this->belongsTo(SubjectQuestion::class, 'quiz_id', 'id');
    }
}
