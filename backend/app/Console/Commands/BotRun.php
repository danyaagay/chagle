<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Telegram\Bot\Laravel\Facades\Telegram;

use App\Services\BotService;

class BotRun extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:bot-run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(BotService $botService)
    {
        $botService->init();

        $updates = Telegram::getUpdates();
        if ($updates) {
            $lastUpdate = $updates[array_key_last($updates)];
            $lastId = $lastUpdate->update_id;
        } else {
            $lastId = -1;
        }

        while (true) {
            $updates = Telegram::getUpdates(['offset' => $lastId + 1]);

            //var_dump($updates);

            foreach ($updates as $update) {
                $lastId = $update->update_id;
                $update = $update->message;

                if (@$update->from->is_bot) continue;

                $botService->update = $update;

                $botService->getUser();

                // Проверяем ивенты
                //$this->eventForBot();

                // Проверяем команды
                $text = mb_strtolower(@$update->text);
                var_dump('Проверяем команды для ' . $text);
                $isCommand = $botService->commandRun($text);

                if ($text && !$isCommand) {
                    $botService->ii($text);
                }
            }
            //sleep(2);
        }
    }
}
