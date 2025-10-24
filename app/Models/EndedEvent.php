<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EndedEvent extends Model
{
    //
    protected $table = "ended_event";
    protected $fillable = [
        "lobby_id"
    ];
}
