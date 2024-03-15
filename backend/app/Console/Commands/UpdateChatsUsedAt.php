<?php

// app/Console/Commands/UpdateChatsUsedAt.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class UpdateChatsUsedAt extends Command
{
    protected $signature = 'app:update-used-at';

    protected $description = 'Update used_at column in chats table with the date of the last message';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $users = User::all();

        foreach ($users as $user) {

            $balance = $user->balance;

            if ($balance < 18) {
                $user->update(['balance' => 2]);
            } else {
                $user->update(['balance' => $balance - 18]);
            }
        }

        $this->info('Used_at column updated for all chats successfully.');
    }
}