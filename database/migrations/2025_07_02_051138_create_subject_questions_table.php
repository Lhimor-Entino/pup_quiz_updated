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
        Schema::create('subject_questions', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->string("difficulty");
            $table->string("answer");
            $table->string("type");
            $table->string("timeLimit");
            $table->string("image")->default(null);
            $table->text("options");
            $table->string("points");
            $table->unsignedBigInteger('subject_id');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
             $table->string('trueFalseAnswer')->nullable();
              $table->string('shortAnswer')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_questions');
    }
};
