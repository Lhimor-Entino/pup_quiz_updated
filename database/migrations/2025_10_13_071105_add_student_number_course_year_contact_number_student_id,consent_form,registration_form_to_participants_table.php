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
        Schema::table('participants', function (Blueprint $table) {
            //
            $table->string('student_number')->nullable();
            $table->string('course_year')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('student_id')->nullable();
            $table->string('consent_form')->nullable();
            $table->string('registration_form')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            //
        });
    }
};
