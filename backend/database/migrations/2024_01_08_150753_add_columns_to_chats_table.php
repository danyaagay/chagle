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
            $table->string('model', 255)->default('gpt-3.5-turbo');
            $table->string('system_message', 255)->default('');
            $table->float('temperature', 2, 1)->default(0.7);
            $table->integer('max_tokens')->default(1024);
            $table->float('top_p', 2, 1)->default(1);
            $table->float('frequency_penalty', 2, 1)->default(0);
            $table->float('presence_penalty', 2, 1)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn('model');
            $table->dropColumn('system_message');
            $table->dropColumn('temperature');
            $table->dropColumn('max_tokens');
            $table->dropColumn('top_p');
            $table->dropColumn('frequency_penalty');
            $table->dropColumn('presence_penalty');
        });
    }
};
