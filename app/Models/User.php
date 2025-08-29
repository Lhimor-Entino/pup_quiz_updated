<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $connection = 'sqlite';
    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'student_number',
        'program',
        'section',
        'username',
        'role', // 1 = teacher, 2 = student, 3 = organizer, 4 = member
        'department'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function quizzes() 
    {
        return $this->hasMany(Quiz::class); 
    }

    public function quizAttempts() 
    {
        return $this->hasMany(QuizAttempt::class); 
    }
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
