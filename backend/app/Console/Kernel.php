<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\DB;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            DB::table('tokens')->where('status', '!=', 3)->update(['limit' => 200, 'status' => 1]);
        })->daily();
        $schedule->command('auth:clear-resets')->daily();
        $schedule->command('sanctum:prune-expired --hours=24')->daily();
        //$schedule->call(function () {
        //    $oneMonthAgo = now()->subMonth();
        //    DB::table('users')
        //        ->where('paid_at', '<=', $oneMonthAgo)
        //        ->update(['paid_at' => null, 'level' => 1, 'quick' => 0]);
        //})->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
