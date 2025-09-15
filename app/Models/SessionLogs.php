<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionLogs extends Model
{
    use HasFactory;
    //

    protected $table = 'session_logs';
    protected $fillable = [
        'user_id',
        'logout_timestamp',
        'ip_address',

    ];
}
