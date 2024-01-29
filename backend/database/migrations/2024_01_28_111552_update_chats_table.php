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
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn(['temperature', 'top_p', 'frequency_penalty', 'presence_penalty']);
            $table->boolean('history')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn('history');
            $table->float('temperature', 2, 1)->default(0.7);
            $table->float('top_p', 2, 1)->default(1);
            $table->float('frequency_penalty', 2, 1)->default(0);
            $table->float('presence_penalty', 2, 1)->default(0);
        });
    }
};
