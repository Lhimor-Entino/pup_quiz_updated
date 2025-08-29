<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lobby', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('lobby_code');
            $table->integer("user_id");
            $table->tinyInteger("archive")->default(0);

            $table->tinyInteger("started")->default(0);
            $table->tinyInteger("finished")->default(0);
            $table->tinyInteger("start_timer")->default(0);
            $table->tinyInteger("reveal_answer")->default(0);
            $table->tinyInteger("reveal_leaderboard")->default(0);
            $table->tinyInteger("reveal_options")->default(0);
            $table->integer("question_num")->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lobby');
    }
};
