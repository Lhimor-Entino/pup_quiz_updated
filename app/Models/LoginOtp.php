<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginOtp extends Model
{
    //
     protected $table = 'login_otp';

    protected $fillable = [
        'otp',
        'email',
        'code',
        'otp_expires_at'
    ];
}
