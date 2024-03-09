<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Http\Controllers\StreamsController;
use Illuminate\Support\Str;

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

	public function store(Request $request, $id = false)
	{
		$user = $request->user();

		return response()->stream(function () use ($user, $request, $id) {
			$isRegenerate = Str::contains(url()->current(), '/regenerate/');
			$reqText = $request->text;

			if ($user->balance <= 0) {
				$text = "Пополните баланс";

				$json = json_encode(['message' => $text, 'error' => true]);

				echo 'data: ' . $json . "\n\n";
				flush();
				ob_end_flush();

				return false;
			}

			$chat = $id ? $user->chats()->find($id) : $user->chats()->create([
				'title' => mb_substr($reqText, 0, 255),
				'used_at' => now(),
			]);

			if (!$chat) {
				return response()->json([
					'error' => 'Chat not found',
				], 500);
			}

			$isOpenRouter = in_array($chat->model, ['gpt-4', 'gpt-4-32k', 'gpt-4-turbo-preview']);
			if ($isOpenRouter && $user->level < 2) {
				$text = "Для использования GPT 4 оплатите аккаунт";

				$json = json_encode(['message' => $text, 'error' => true]);

				echo 'data: ' . $json . "\n\n";
				flush();
				ob_end_flush();

				return false;
			}

			if ($isRegenerate) {
				$lastMessages = $chat->messages()->orderBy('id', 'desc')->limit(2)->get();

				if ($lastMessages[1]->role != 'user' || $lastMessages[0]->role != 'assistant') {
					return response()->json([
						'error' => 'Unknown error 2',
					]);
				}

				$reqText = $lastMessages[1]->text;
			} else {
				$message = $chat->messages()->create([
					'content' => $reqText,
					'role' => 'user',
				]);
			}

			if ($chat->history) {
				$messagesQuery = $chat->messages()
					->where('error_code', NULL)
					->orderByDesc('id');

				if ($isRegenerate) {
					$messagesQuery->whereNot('id', $lastMessages[0]->id);
				}

				$messages = $messagesQuery->get();

				$history = $this->getHistory($messages, $chat->model);
				$history = array_reverse($history);
			} else {
				$history = [];
			}

			$settings = [
				'model' => $chat->model,
				'system_message' => $chat->system_message,
				'max_tokens' => $chat->max_tokens,
			];

			$answer = StreamsController::stream($reqText, $history, $settings);

			if ($answer['error']) {
				if ($isRegenerate) {
					$lastMessages[0]->update([
						'content' => $answer['answer'],
						'error_code' => $answer['error_code']
					]);
				} else {
					$chatAnswer = $chat->messages()->create([
						'content' => $answer['answer'],
						'role' => 'assistant',
						'error_code' => $answer['error_code']
					]);
				}
			} else {
				if ($isRegenerate) {
					$lastMessages[0]->update([
						'content' => $answer['answer'],
						'error_code' => NULL
					]);
				} else {
					$chatAnswer = $chat->messages()->create([
						'content' => $answer['answer'],
						'role' => 'assistant',
					]);

					echo 'data: {"answerId":"' . $chatAnswer->id . '"}' . "\n\n";

					echo 'data: {"messageId":"' . $message->id . '"}' . "\n\n";

					if (!$id) {
						echo 'data: {"chatId":"' . $chat->id . '"}' . "\n\n";
					}
				}

				$newBalance = $this->calculate($history, $user->balance, $reqText, $answer['answer'], $chat->model, $answer['id'] ?? null);

				//Учет в транзакциях
				$user->transactions()->create([
					'type' => 'Списание',
					'amount' => $user->balance - $newBalance,
				]);
				$user->update(['balance' => $newBalance]);

				echo 'data: {"amount":"' . $newBalance . '"}' . "\n\n";
			}

			$chat->update(['sub_title' => mb_substr($answer['answer'], 0, 255), 'used_at' => now()]);
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

	public static function getHistory($messages, $model)
	{
		$array = [];
		$contextSize = ($model === 'gpt-3.5-turbo-16k') ? 16383 : 4095;
		$contextLength = 0;

		foreach ($messages as $message) {
			$roleLength = mb_strlen($message->role);
			$contentLength = mb_strlen($message->content);

			// Проверяем, поместится ли роль и содержимое в контекст
			if (($contextLength + $roleLength + $contentLength) <= $contextSize) {
				$array[] = ['role' => $message->role, 'content' => $message->content];

				// Увеличиваем длину контекста на длину роли и содержимого, а также учитываем пробелы между ними
				$contextLength += $roleLength + $contentLength + 2;
			} else {
				// Если контекст уже достиг максимального размера, прекращаем добавление сообщений
				break;
			}
		}

		return $array;
	}

	public static function calculate($history, $balance, $question, $answer, $model, $id)
	{
		$history = $history ?: [['role' => 'user', 'content' => $question]];

		// Считаем количество токенов
		if ($id) {
			$curl = curl_init('https://openrouter.ai/api/v1/generation?id=' . $id);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($curl, CURLOPT_HTTPHEADER, array(
				'Authorization: Bearer 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'
			));
			$response = curl_exec($curl);
			$data = json_decode($response, true);

			$tokenCount = $data['data']['tokens_prompt'] + $data['data']['tokens_completion'];
		} else {
			$text = '';
			foreach ($history as $history) {
				$text .= $history['content'];
			}
			$text .= $answer;
			$text = str_replace(" ", "", $text);

			$tokenCount = ceil(mb_strlen($text) / 2);
		}

		// Рассчитываем стоимость
		if ($model === 'gpt-3.5-turbo') {
			$pricePerTokens = 0.2;
		} elseif ($model === 'gpt-3.5-turbo-16k') {
			$pricePerTokens = 0.4;
		} elseif ($model === 'gpt-4') {
			$pricePerTokens = 6;
		} elseif ($model === 'gpt-4-32k') {
			$pricePerTokens = 12;
		} elseif ($model === 'gpt-4-turbo-preview') {
			$pricePerTokens = 3;
		}
		$pricePerToken = $pricePerTokens / 1000;
		$cost = $tokenCount * $pricePerToken;


		// Вычитаем стоимость из баланса
		$balance -= $cost;

		return $balance;
	}
}
