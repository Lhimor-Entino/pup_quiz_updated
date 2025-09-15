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
        Schema::create('lobby_mngnt', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('lobby_id')->nullable();
            $table->tinyInteger('action')->nullable()->comment("0->create, 1->edit, 2->delete");
            $table->timestamps();

            // $table->foreign('lobby_id')->references("id")->on("lobby");

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lobby_mngnt');
    }
};
