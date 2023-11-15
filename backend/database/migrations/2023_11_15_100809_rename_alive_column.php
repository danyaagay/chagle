<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            $table->renameColumn('alive', 'status');
        });
    }


    public function down(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            $table->renameColumn('status', 'alive');
        });
    }
};
