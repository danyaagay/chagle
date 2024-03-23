<?php

namespace App\Http\Controllers;

use Telegram\Bot\Laravel\Facades\Telegram;
use App\Services\BotService;

class BotController extends Controller
{

	public function handle(BotService $botService)
	{
		$botService->init();

		// Пропускаем старые
		//Telegram::getWebhookUpdate(); 

		$update = Telegram::getWebhookUpdate();

		if (@$update->from->is_bot) return 'ok';

		$botService->update = $update->message;

		$botService->getUser();

		// Проверяем ивенты
		//$botService->eventForBot();

		// Проверяем команды
		$text = mb_strtolower(@$update->text);
		$isCommand = $botService->commandRun($text);

		if ($text && !$isCommand) {
			$botService->ii($text);
		}

		return 'ok';
	}
}