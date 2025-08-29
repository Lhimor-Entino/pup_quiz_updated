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
        Schema::table('lobby', function (Blueprint $table) {
            //
            $table->string('levels_finished')->default("");
            $table->string('current_level')->default("");;
            // $table->integer('archive')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lobby', function (Blueprint $table) {
            //
        });
    }
};
