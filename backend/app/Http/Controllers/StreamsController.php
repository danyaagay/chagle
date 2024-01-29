<?php

namespace App\Http\Controllers;

use OpenAI;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\ProxyController;

class StreamsController extends Controller
{
	/**
	 * The stream source.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public static function stream($question, $history, $settings)
	{
		//DANGER FOR PRODUCTION
		$debug = false;

		ignore_user_abort(true);

		//$question = 'Provide your response in a markdown code block ' . $question;

		if (!$history) {
			$history = [
				['role' => 'user', 'content' => $question]
			];
		}

		if ($settings['system_message']) {
			array_unshift($history, ['role' => 'system', 'content' => $settings['system_message']]);
		}

		//Cancel temp id
		$tempId = Str::random(15);
		Redis::set($tempId, true);

		if (ob_get_level() == 0) ob_start();

		if ($debug) {
			$stream = ['Р', 'а', 'з', 'н', 'о', 'о', 'б', 'р', 'а', 'з', 'н', 'ы', 'й', ' ', 'и', ' ', 'б', 'о', 'г', 'а', 'т', 'ы', 'й', ' ', 'о', 'п', 'ы', 'т', ' ', 'п', 'о', 'в', 'ы', 'ш', 'е', 'н', 'и', 'е', ' ', 'у', 'р', 'о', 'в', 'н', 'я', ' ', 'г', 'р', 'а', 'ж', 'д', 'а', 'н', 'с', 'к', 'о', 'г', 'о', ' ', 'с', 'о', 'з', 'н', 'а', 'н', 'и', 'я', ' ', 'п', 'о', 'з', 'в', 'о', 'л', 'я', 'е', 'т', ' ', 'о', 'ц', 'е', 'н', 'и', 'т', 'ь', ' ', 'з', 'н', 'а', 'ч', 'е', 'н', 'и', 'е', ' ', 'н', 'а', 'п', 'р', 'а', 'в', 'л', 'е', 'н', 'и', 'й', ' ', 'п', 'р', 'о', 'г', 'р', 'е', 'с', 'с', 'и', 'в', 'н', 'о', 'г', 'о', ' ', 'р', 'а', 'з', 'в', 'и', 'т', 'и', 'я', '!', ' ', 'Д', 'о', 'р', 'о', 'г', 'и', 'е', ' ', 'д', 'р', 'у', 'з', 'ь', 'я', ',', ' ', 'к', 'о', 'н', 'с', 'у', 'л', 'ь', 'т', 'а', 'ц', 'и', 'я', ' ', 'с', ' ', 'п', 'р', 'о', 'ф', 'е', 'с', 'с', 'и', 'о', 'н', 'а', 'л', 'а', 'м', 'и', ' ', 'и', 'з', ' ', 'I', 'T', ' ', 'т', 'р', 'е', 'б', 'у', 'е', 'т', ' ', 'о', 'т', ' ', 'н', 'а', 'с', ' ', 'а', 'н', 'а', 'л', 'и', 'з', 'а', ' ', 'э', 'к', 'о', 'н', 'о', 'м', 'и', 'ч', 'е', 'с', 'к', 'о', 'й', ' ', 'ц', 'е', 'л', 'е', 'с', 'о', 'о', 'б', 'р', 'а', 'з', 'н', 'о', 'с', 'т', 'и', ' ', 'п', 'р', 'и', 'н', 'и', 'м', 'а', 'е', 'м', 'ы', 'х', ' ', 'р', 'е', 'ш', 'е', 'н', 'и', 'й', '.', ' ', 'П', 'о', 'в', 'с', 'е', 'д', 'н', 'е', 'в', 'н', 'а', 'я', ' ', 'п', 'р', 'а', 'к', 'т', 'и', 'к', 'а', ' ', 'п', 'о', 'к', 'а', 'з', 'ы', 'в', 'а', 'е', 'т', ',', ' ', 'ч', 'т', 'о', ' ', 'д', 'а', 'л', 'ь', 'н', 'е', 'й', 'ш', 'е', 'е', ' ', 'р', 'а', 'з', 'в', 'и', 'т', 'и', 'е', ' ', 'р', 'а', 'з', 'л', 'и', 'ч', 'н', 'ы', 'х', ' ', 'ф', 'о', 'р', 'м', ' ', 'д', 'е', 'я', 'т', 'е', 'л', 'ь', 'н', 'о', 'с', 'т', 'и', ' ', 'и', 'г', 'р', 'а', 'е', 'т', ' ', 'в', 'а', 'ж', 'н', 'у', 'ю', ' ', 'р', 'о', 'л', 'ь', ' ', 'в', ' ', 'ф', 'о', 'р', 'м', 'и', 'р', 'о', 'в', 'а', 'н', 'и', 'и', ' ', 'н', 'а', 'п', 'р', 'а', 'в', 'л', 'е', 'н', 'и', 'й', ' ', 'п', 'р', 'о', 'г', 'р', 'е', 'с', 'с', 'и', 'в', 'н', 'о', 'г', 'о', ' ', 'р', 'а', 'з', 'в', 'и', 'т', 'и', 'я', '.'];
		} else {
			do {
				$error = true;
				$errorCode = false;

				$token = TokenController::getToken();
				$proxy = ProxyController::getProxy();
				if (!$token || !$proxy) {
					$errorCode = '1';
					break;
				}

				$client = OpenAI::factory()
					->withApiKey($token->token)
					->withHttpClient(new \GuzzleHttp\Client(['verify' => false, 'proxy' => "{$proxy->schema}://{$proxy->auth}@{$proxy->ip}"]))
					->make();

				try {
					$stream = $client->chat()->createStreamed([
						'model' => $settings['model'],
						'messages' => $history,
						'max_tokens' => $settings['max_tokens'],
					]);

					$error = false;
				} catch (\OpenAI\Exceptions\ErrorException $e) {
					$errorCode = @$e->getErrorCode() ?: $e->getErrorType();
					$errorMessage = @$e->getMessage();
					//var_dump('2', $errorMessage, $errorCode);
				} catch (\OpenAI\Exceptions\TransporterException $e) {
					$errorCode = @$e->getCode();
					$errorMessage = @$e->getMessage();
					//var_dump('1', $errorMessage, $errorCode);
				}

				// Приостанавливаем токен
				if ($errorCode === 'rate_limit_exceeded') {
					TokenController::setStatus($token, 2);
				} elseif ($errorCode === 'invalid_request_error') {
					break;
				} elseif ($errorCode === 0 ) {
					ProxyController::setStatus($proxy, 2);
					break;
				}
				// Нужно дописать другие ошибки
			} while ($error && $token && $proxy);

			if ($error) {
				$text = "В данный момент невозможно обработать запрос. Ошибка: {$errorCode}";

				$json = json_encode(['message' => $text, 'error' => true]);

				echo 'data: ' . $json . "\n\n";
				ob_flush();
				flush();
				ob_end_flush();

				return [
					'error' => true,
					'error_code' => $errorCode,
					'answer' => $text
				];
			}
		}

		echo 'data: {"tempId":"' . $tempId . '"}' . "\n\n";
		ob_flush();
		flush();

		$answer = '';
		foreach ($stream as $response) {
			if ($debug) {
				$text = $response;
				usleep(50000);
			} else {
				$text = $response->choices[0]->delta->content;
			}

			if (connection_aborted() || !Redis::get($tempId)) {
				break;
			}

			$answer .= $text;

			$json = json_encode(['message' => $text]);

			echo 'data: ' . $json . "\n\n";
			ob_flush();
			flush();
		}

		ob_end_flush();

		return ['error' => false, 'answer' => $answer];
	}
}
