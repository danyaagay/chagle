<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Http\Controllers\StreamsController;
use Illuminate\Support\Str;

use App\Services\ChatService;
use App\Services\UserService;
use App\Services\MessageService;
use App\Services\StreamService;

class MessageController extends Controller
{
	public function index(Request $request, $id)
	{
		$user = $request->user();

		$chat = $user->chats()->where('id', $id)->first();

		if (!$chat) {
			return response()->json([
				'error' => 'Chat not found',
			], 500);
		}

		$messages = $chat->messages()
			->selectRaw("
                IF(messages.role = 'user', true, false) AS you,
                DATE_FORMAT(messages.created_at, '%Y-%m-%d %H:%i:%s') AS date,
                messages.content AS text,
                messages.id AS id,
                IF(messages.error_code IS NULL, false, true) AS is_error
            ")
			->orderBy('id', 'desc')
			->skip($request->offset)
			->take(30)
			->get()
			->toArray();

		$messagesReverse = array_reverse($messages);

		if ($chat->messages()->orderBy('id', 'desc')->count() > $request->offset + 30) {
			$hasMore = true;
		} else {
			$hasMore = false;
		}

		return response()->json([
			'messages' => $messagesReverse,
			'hasMore' => $hasMore
		]);
	}

	public function store(Request $request, $id = false, ChatService $chatService, UserService $userService, StreamService $streamService, MessageService $messageService)
	{
		$user = $request->user();

		return response()->stream(function () use ($user, $request, $id, $userService, $chatService, $streamService, $messageService) {
			$isRegenerate = Str::contains(url()->current(), '/regenerate/');

			if ($user->balance <= 0) {
				$streamService->sendMessage(['message' => 'Пополните баланс', 'error' => true]);

				return response()->json([
					'error' => 'Low balance',
				], 500);
			}

			$chat = $chatService->createOrFind($user, $id, $request->text);
			if (!$chat) {
				return response()->json([
					'error' => 'Chat not found',
				], 500);
			}

			if (!$userService->checkLevel($chat, $user)) {
				$streamService->sendMessage(['message' => 'Для использования GPT 4 оплатите аккаунт', 'error' => true]);

				return response()->json([
					'error' => 'Wrong model as level',
				], 500);
			}

			if ($isRegenerate) {
				$lastMessages = $messageService->getLasts($chat, $request->text);
				$message = $lastMessages[1];
			} else {
				$message = $messageService->create($chat, $request->text, 'user');
			}

			if (!$message) {
				return response()->json([
					'error' => 'Message cannot be created or not found',
				], 500);
			}

			$history = $messageService->getHistory($chat, $lastMessages[0]->id ?? false, $message->content);

			$settings = [
				'model' => $chat->model,
				'system_message' => $chat->system_message,
				'max_tokens' => $chat->max_tokens,
			];

			$answer = StreamsController::stream($message->content, $history, $settings);

			if ($isRegenerate) {
				$messageService->update($lastMessages[0], $answer['answer'], $answer['error_code'] ?? NULL);
			} else {
				$chatAnswer = $messageService->create($chat, $answer['answer'], 'assistant', $answer['error_code'] ?? NULL);
			}

			if (!$answer['error_code']) {
				if (!$isRegenerate) {
					$streamService->sendMessage(['answerId' => $chatAnswer->id]);

					$streamService->sendMessage(['messageId' => $message->id]);

					if (!$id) {
						$streamService->sendMessage(['chatId' => $chat->id]);
					}
				}

				$newBalance = $userService->balanceDown($history, $user, $answer['answer'], $chat->model, $answer['id'] ?? null);

				$streamService->sendMessage(['amount' => number_format($newBalance, 5, '.', '')]);
			}

			$chatService->subTitleUpdate($chat, $answer['answer']);
		}, 200, [
			'Cache-Control' => 'no-cache',
			'X-Accel-Buffering' => 'no',
			'Content-Type' => 'text',
		]);
	}

	public function cancel(Request $request)
	{
		Redis::del($request->id);
		return true;
	}
}
