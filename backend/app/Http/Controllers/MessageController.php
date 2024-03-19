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

	public function store(Request $request, MessageService $messageService, ChatService $chatService, UserService $userService, StreamService $streamService, $id = false)
	{
		$isRegenerate = Str::contains(url()->current(), '/regenerate/');

		$user = $request->user();

		$chat = $chatService->createOrFind($user, $id, $request->text);
		if (!$chat) {
			return response()->json([
				'error' => 'Chat not found',
			], 500);
		}

		return $streamService->stream($user, $chat, $request, $isRegenerate, $id, $messageService, $chatService, $userService, $streamService);
	}

	public function cancel(Request $request)
	{
		Redis::del($request->id);
		return true;
	}
}
