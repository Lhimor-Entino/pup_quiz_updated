<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lobby extends Model
{
    //
    protected $table = 'lobby';

    protected $fillable = [
        'name',
        'lobby_code',
        'user_id'
    ];

    public function subjects()
    {
        return $this->hasMany(Subjects::class);
    }

    public function lobbyMngnt()
    {
        return $this->hasMany(LoobyManagement::class);
    }
     public function pre_registration_log()
    {
        return $this->hasMany(PreRegistration::class);
    }
}
