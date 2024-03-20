<?php

namespace App\Services;

use OpenAI;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\ProxyController;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class StreamService
{
	public function isOpenRouter($model)
	{
		$isOpenRouter = in_array($model, [
			'openai/gpt-4',
			'openai/gpt-4-32k',
			'openai/gpt-4-turbo-preview',
			'anthropic/claude-instant-1',
			'anthropic/claude-3-opus',
			'anthropic/claude-3-haiku',
			'google/gemini-pro'
		]);
		return $isOpenRouter;
	}

	public function noHasSettings($model)
	{
		$noHasSettings = in_array($model, [
			'anthropic/claude-instant-1',
			'anthropic/claude-3-opus',
			'anthropic/claude-3-haiku',
			'google/gemini-pro'
		]);
		return $noHasSettings;
	}

	public function sendMessage($json)
	{
		$json = json_encode($json);

		echo 'data: ' . $json . "\n\n";
		ob_flush();
		flush();
	}

	public function sendTempId()
	{
		$tempId = Str::random(15);
		Redis::set($tempId, true);
		$this->sendMessage(['tempId' => $tempId]);
		return $tempId;
	}

	public function getClient($token, $proxy)
	{
		if ($token && $proxy) {
			$client = OpenAI::factory()
				->withApiKey($token->token)
				->withHttpClient(new \GuzzleHttp\Client(['verify' => false, 'proxy' => "{$proxy->schema}://{$proxy->auth}@{$proxy->ip}"]))
				->make();
		} else {
			$client = OpenAI::factory()
				->withBaseUri('https://openrouter.ai/api/v1')
				->withApiKey('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')
				->make();
		}
		return $client;
	}

	public function execute($method, $model, $history, $maxTokens)
	{
		$isOpenRouter = $this->isOpenRouter($model);
		$noHasSettings = $this->noHasSettings($model);

		do {
			$error = true;
			$errorCode = null;

			if (!$isOpenRouter) {
				$token = TokenController::getToken();
				$proxy = ProxyController::getProxy();
				if (!$token || !$proxy) {
					$errorCode = '1';
					break;
				}
			}

			$client = $this->getClient($token ?? false, $proxy ?? false);

			try {
				$query = [
					'model' => $model,
					'messages' => $history,
				];

				if (!$noHasSettings) {
					$query['max_tokens'] = $maxTokens;
				}

				$result = $client->chat()->$method($query);

				$error = false;
			} catch (\OpenAI\Exceptions\ErrorException $e) {
				$errorCode = @$e->getErrorCode() ?: $e->getErrorType();
			} catch (\OpenAI\Exceptions\TransporterException $e) {
				$errorCode = @$e->getCode();
			}

			// Приостанавливаем токен или прокси
			if (!$isOpenRouter) {
				if ($errorCode === 'rate_limit_exceeded') {
					TokenController::setStatus($token, 2);
				} elseif ($errorCode === 0) {
					ProxyController::setStatus($proxy, 2);
				}
			}
		} while ($error && $token && $proxy);

		return [
			'error' => $error,
			'errorCode' => $errorCode,
			'result' => $result ?? null
		];
	}

	public function stream($user, $chat, $request, $isRegenerate, $id, MessageService $messageService, ChatService $chatService, UserService $userService, StreamService $streamService)
	{
		return response()->stream(function () use ($id, $user, $chat, $request, $userService, $chatService, $streamService, $messageService, $isRegenerate) {
			$isOpenRouter = $this->isOpenRouter($chat->model);
			$debug = false; //DANGER FOR PRODUCTION

			if ($user->level < 1) {
				$streamService->sendMessage(['message' => 'В данный момент невозможно обработать запрос. Ошибка: 1', 'error' => true]);

				return;
			}

			if ($user->balance <= 0) {
				$streamService->sendMessage(['message' => 'Пополните баланс', 'error' => true]);

				return response()->json([
					'error' => 'Low balance',
				], 500);
			}

			if (!$userService->checkLevel($user, $chat)) {
				$streamService->sendMessage(['message' => 'Для использования этой модели оплатите аккаунт', 'error' => true]);

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

			//if (!$message) {
			//	return response()->json([
			//		'error' => 'Message cannot be created or not found',
			//	], 500);
			//}

			$history = $messageService->getHistory($chat, $lastMessages[0]->id ?? false, $message->content);

			ignore_user_abort(true);

			if ($debug) {
				$stream['result'] = ['Р', 'а', 'з', 'н', 'о', 'о', 'б', 'р', 'а', 'з', 'н', 'ы', 'й', ' ', 'и', ' ', 'б', 'о', 'г', 'а', 'т', 'ы', 'й', ' ', 'о', 'п', 'ы', 'т', ' ', 'п', 'о', 'в', 'ы', 'ш', 'е', 'н', 'и', 'е', ' ', 'у', 'р', 'о', 'в', 'н', 'я', ' ', 'г', 'р', 'а', 'ж', 'д', 'а', 'н', 'с', 'к', 'о', 'г', 'о', ' ', 'с', 'о', 'з', 'н', 'а', 'н', 'и', 'я', ' ', 'п', 'о', 'з', 'в', 'о', 'л', 'я', 'е', 'т', ' ', 'о', 'ц', 'е', 'н', 'и', 'т', 'ь', ' ', 'з', 'н', 'а', 'ч', 'е', 'н', 'и', 'е', ' ', 'н', 'а', 'п', 'р', 'а', 'в', 'л', 'е', 'н', 'и', 'й', ' ', 'п', 'р', 'о', 'г', 'р', 'е', 'с', 'с', 'и', 'в', 'н', 'о', 'г', 'о', ' ', 'р', 'а', 'з', 'в', 'и', 'т', 'и', 'я', '!', ' ', 'Д', 'о', 'р', 'о', 'г', 'и', 'е', ' ', 'д', 'р', 'у', 'з', 'ь', 'я', ',', ' ', 'к', 'о', 'н', 'с', 'у', 'л', 'ь', 'т', 'а', 'ц', 'и', 'я', ' ', 'с', ' ', 'п', 'р', 'о', 'ф', 'е', 'с', 'с', 'и', 'о', 'н', 'а', 'л', 'а', 'м', 'и', ' ', 'и', 'з', ' ', 'I', 'T', ' ', 'т', 'р', 'е', 'б', 'у', 'е', 'т', ' ', 'о', 'т', ' ', 'н', 'а', 'с', ' ', 'а', 'н', 'а', 'л', 'и', 'з', 'а', ' ', 'э', 'к', 'о', 'н', 'о', 'м', 'и', 'ч', 'е', 'с', 'к', 'о', 'й', ' ', 'ц', 'е', 'л', 'е', 'с', 'о', 'о', 'б', 'р', 'а', 'з', 'н', 'о', 'с', 'т', 'и', ' ', 'п', 'р', 'и', 'н', 'и', 'м', 'а', 'е', 'м', 'ы', 'х', ' ', 'р', 'е', 'ш', 'е', 'н', 'и', 'й', '.', ' ', 'П', 'о', 'в', 'с', 'е', 'д', 'н', 'е', 'в', 'н', 'а', 'я', ' ', 'п', 'р', 'а', 'к', 'т', 'и', 'к', 'а', ' ', 'п', 'о', 'к', 'а', 'з', 'ы', 'в', 'а', 'е', 'т', ',', ' ', 'ч', 'т', 'о', ' ', 'д', 'а', 'л', 'ь', 'н', 'е', 'й', 'ш', 'е', 'е', ' ', 'р', 'а', 'з', 'в', 'и', 'т', 'и', 'е', ' ', 'р', 'а', 'з', 'л', 'и', 'ч', 'н', 'ы', 'х', ' ', 'ф', 'о', 'р', 'м', ' ', 'д', 'е', 'я', 'т', 'е', 'л', 'ь', 'н', 'о', 'с', 'т', 'и', ' ', 'и', 'г', 'р', 'а', 'е', 'т', ' ', 'в', 'а', 'ж', 'н', 'у', 'ю', ' ', 'р', 'о', 'л', 'ь', ' ', 'в', ' ', 'ф', 'о', 'р', 'м', 'и', 'р', 'о', 'в', 'а', 'н', 'и', 'и', ' ', 'н', 'а', 'п', 'р', 'а', 'в', 'л', 'е', 'н', 'и', 'й', ' ', 'п', 'р', 'о', 'г', 'р', 'е', 'с', 'с', 'и', 'в', 'н', 'о', 'г', 'о', ' ', 'р', 'а', 'з', 'в', 'и', 'т', 'и', 'я', '.'];
			} else {
				$stream = $this->execute('createStreamed', $chat->model, $history, $chat->max_tokens);

				if ($stream['error']) {
					$text = "В данный момент невозможно обработать запрос. Ошибка: {$stream['errorCode']}";

					$this->sendMessage(['message' => $text, 'error' => true]);

					$messageService->errorNoticeAdmin($text);

					return false;
				}
			}

			$tempId = $this->sendTempId();

			$answer = '';
			foreach ($stream['result'] as $response) {
				if ($debug) {
					$text = $response;
					usleep(50000);
				} else {
					$text = $response->choices[0]->delta->content;
				}

				if (connection_aborted() && !$isOpenRouter || !Redis::get($tempId) && !$isOpenRouter) { //ВРЕМЕННО стоит !$isOpenRouter (баг OpenRouter)
					break;
				}

				$answer .= $text;

				$this->sendMessage(['message' => $text]);

				$idOpenRouter = $isOpenRouter ? $response->id : null;
			}

			if ($isRegenerate) {
				$messageService->update($lastMessages[0], $answer, $stream['errorCode']);
			} else {
				$chatAnswer = $messageService->create($chat, $answer, 'assistant', $stream['errorCode']);
			}

			if (!$isRegenerate) {
				$streamService->sendMessage(['answerId' => $chatAnswer->id]);

				$streamService->sendMessage(['messageId' => $message->id]);

				if (!$id) {
					$streamService->sendMessage(['chatId' => $chat->id]);
				}
			}

			$newBalance = $userService->balanceDown($history, $user, $answer, $chat->model, $idOpenRouter);

			$streamService->sendMessage(['amount' => number_format($newBalance, 5, '.', '')]);

			$chatService->subTitleUpdate($chat, $answer);
		}, 200, [
			'Cache-Control' => 'no-cache',
			'X-Accel-Buffering' => 'no',
			'Content-Type' => 'text', //text/event-stream
		]);
	}
}
