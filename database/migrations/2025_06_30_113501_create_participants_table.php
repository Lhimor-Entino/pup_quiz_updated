<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
     public function up()
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->string('team');
            $table->string('prev_answer')->nullable();
            $table->string('prev_answer_correct')->default(0); // means false
            $table->text('members'); // JSON string
            $table->integer('score')->default(0);
            $table->string("lobby_code");
            $table->integer('archive')->default(0);
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
