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
        Schema::connection('bot-mysql')->create('users', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('telegram_id')->nullable();
            $table->string('shortname')->nullable();
            $table->string('name')->nullable();
            $table->string('model', 255)->default('gpt-3.5-turbo');
            $table->boolean('web')->default(0);
            $table->integer('level')->default(1);
            $table->integer('quick')->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
