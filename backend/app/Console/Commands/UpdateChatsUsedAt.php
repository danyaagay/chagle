<?php

// app/Console/Commands/UpdateChatsUsedAt.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Chat;

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
        $chats = Chat::all();

        foreach ($chats as $chat) {
            $lastMessage = $chat->messages()->latest()->first();

            if ($lastMessage) {
                $chat->update(['used_at' => $lastMessage->created_at]);
            }
        }

        $this->info('Used_at column updated for all chats successfully.');
    }
}