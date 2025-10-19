<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreRegistration extends Model
{
    //
    protected $table = "pre_registration_log";
      protected $fillable = [
        'status',
        'participant_id',
        'lobby_id',
        'comment'
    ];

    public function lobby()
    {
        return $this->belongsTo(Lobby::class, 'lobby_id', 'id');
    }
     public function participant()
    {
        return $this->belongsTo(Participants::class, 'participant_id', 'id');
    }
}
