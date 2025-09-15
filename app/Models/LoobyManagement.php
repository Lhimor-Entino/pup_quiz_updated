<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoobyManagement extends Model
{
    //
    protected $table = 'lobby_mngnt'; // if your table is not pluralized
    use HasFactory;
    public $fillable = ["user_id","lobby_id","action"];

    public function lobby(){
        return $this->belongsTo(Lobby::class);
    }
}
