<?php

namespace App\Http\Controllers;

use Telegram\Bot\Laravel\Facades\Telegram;
use App\Models\Bot\User;
use OpenAI;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\ProxyController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class BotController extends Controller
{
	// Используемые глобальные переменные
	public $update, $bot, $markup, $model, $user, $webUser;
	public $commands = [
		'profile' => ['профиль'],
		'billing' => ['пополнить баланс'],
		'new' => ['новый чат'],
		'connect' => ['привязать аккаунт chagle'],
		'change' => ['изменить модель', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
		'start' => ['/start']
	];

	// Функция инициализации вместо construct

	public function init()
	{
		$this->bot = Telegram::bot();
		$this->markup = json_encode([
			'keyboard' => [
				['Новый чат'],
				['Пополнить баланс', 'Профиль'],
				['Привязать аккаунт Chagle', 'Изменить модель'],
			],
			'resize_keyboard' => true,
			'one_time_keyboard' => true
		]);
	}

	/**
	 * Execute the console command.
	 */
	public function handle()
	{
		$this->init();

		$this->update = Telegram::getWebhookUpdate();

		$update = Telegram::getWebhookUpdate();

		if (@$update->from->is_bot) return 'ok';

		$this->update = $update;

		$this->getUser();

		// Проверяем ивенты
		//$this->eventForBot();

		// Проверяем команды
		$text = mb_strtolower(@$update->text);
		$isCommand = $this->commandRun($text);

		if ($text && !$isCommand) {
			$this->ii($text);
		}

		return 'ok';
	}

	// Поиск команды

	public function commandRun($text, $argument = NULL)
	{
		foreach ($this->commands as $functionName => $subCommands) {
			if (in_array($text, $subCommands)) {
				call_user_func([self::class, $functionName], $argument);
				return true;
			}
		}

		return false;
	}

	// Получить или создать пользователя

	public function getUser()
	{
		$from = $this->update->from;

		$user = User::where('telegram_id', $from->id);

		$userName = $from->first_name . ' ' . $from->last_name;

		if ($user->exists()) {
			$user = $user->first();
			$user->shortname = @$from->username;
			$user->name = $userName;
			$user->save();
		} else {
			$user = User::create([
				'telegram_id' => $from->id,
				'shortname' => @$from->username,
				'name' => $userName,
				'quick' => 30,
				'level' => 1
			]);
		}

		$this->user = $user;

		if ($user->web) {
			$this->webUser = \App\Models\User::where('telegram_id', $from->id)->first();
		}
	}

	// Произошло событие для бота

	public function eventForBot()
	{
		if (@$this->update->my_chat_member->new_chat_member->status === 'kicked') {
			// Очистить диалоги но оставить самого пользователя (чтобы не снести баланс)
		} elseif (@$this->update->my_chat_member->new_chat_member->status === 'member' || @$this->update->my_chat_member->new_chat_member->status === 'administrator') {
			if ($this->update->my_chat_member->chat->type === 'private') {
				// Ответ в ЛС
			} else {
				// Ответ в чатах
			}
		}
	}

	// Доступные команды

	// Показывает информацию о профиле

	public function profile()
	{
		$chatId = @$this->update->chat->id;

		if ($this->webUser) {
			$user = $this->webUser;
		} else {
			$user = $this->user;
		}

		$this->bot->sendMessage([
			'chat_id' => $chatId,
			'text' => $user->name . ' (id' . $user->telegram_id . ')
Запросов ' . $user->quick . '
Модель ' . $this->user->model,
			'reply_markup' => $this->markup
		]);
	}

	// Оплата

	public function billing()
	{
		$chatId = @$this->update->chat->id;

		$this->bot->sendMessage([
			'chat_id' => $chatId,
			'text' => 'Для оплаты напишите нам @chaglemanager',
			'reply_markup' => $this->markup
		]);
	}

	// Новый чат и очистка контекста

	public function new()
	{
		$chatId = @$this->update->chat->id;

		$this->user->messages()->delete();

		$this->bot->sendMessage([
			'chat_id' => $chatId,
			'text' => 'Начат новый чат, контекст очищен',
			'reply_markup' => $this->markup
		]);
	}

	// Изменить модель

	public function change()
	{
		$chatId = @$this->update->chat->id;

		$text = mb_strtolower(@$this->update->text);

		if ($text === 'gpt-3.5-turbo') {
			$this->user->model = 'gpt-3.5-turbo';
			$this->user->save();


			$this->bot->sendMessage([
				'chat_id' => $chatId,
				'text' => 'Модель успешно изменена на gpt-3.5-turbo',
				'reply_markup' => $this->markup
			]);
		} elseif ($text === 'gpt-3.5-turbo-16k') {
			$this->user->model = 'gpt-3.5-turbo-16k';
			$this->user->save();

			$this->bot->sendMessage([
				'chat_id' => $chatId,
				'text' => 'Модель успешно изменена на gpt-3.5-turbo-16k',
				'reply_markup' => $this->markup
			]);
		} else {
			$keyboard = json_encode([
				'keyboard' => [
					['gpt-3.5-turbo'],
					['gpt-3.5-turbo-16k'],
				],
				'resize_keyboard' => true,
				'one_time_keyboard' => true
			]);

			$this->bot->sendMessage([
				'chat_id' => $chatId,
				'text' => 'Выберите доступную модель на клавиатуре',
				'reply_markup' => $keyboard
			]);
		}
	}

	// Старт

	public function start()
	{
		$chatId = @$this->update->chat->id;

		$this->bot->sendMessage([
			'chat_id' => $chatId,
			'text' => '🌟 Привет! Я Чагли бот с моделью ChatGPT

🧠 Пишите код, создавайте контент, и узнавайте новое с помощью передовой модели искусственного интеллекта
            
💰 Без абонентской платы и сгорания токенов!
            
🚀 Наши тарифы:
            
Бесплатно
30 запросов
ChatGPT 3.5

Базовый 199 ₽
700 запросов
ChatGPT 3.5

Премиум 299 ₽
1500 запросов
ChatGPT 3.5
            
🔄 Чтобы оптимизировать расходы, нажмите кнопку "Новый чат", чтобы сбросить контекст',
			'reply_markup' => $this->markup
		]);
	}

	// Привязать аккаунт Chagle

	public function connect()
	{
		$chatId = @$this->update->chat->id;

		if ($this->webUser) {
			$this->bot->sendMessage([
				'chat_id' => $chatId,
				'text' => 'Вы уже привязали свой аккаунт к ' . $this->webUser->name,
				'reply_markup' => $this->markup
			]);
		} else {
			$token = Crypt::encryptString(serialize([
				'telegram_id' => $this->user->telegram_id,
				'expired' => now()->copy()->addHours(1)->toDateTimeString()
			]));

			$this->bot->sendMessage([
				'chat_id' => $chatId,
				'text' => 'Чтобы привязать аккаунт перейдите по ссылке ' . env('APP_URL') . '/telegram/' . $token,
				'reply_markup' => $this->markup
			]);
		}
	}

	// Обработка ИИ
	public function ii($text)
	{
		$chatId = @$this->update->chat->id;

		// Проверяем баланс
		if ($this->webUser && $this->webUser->balance <= 0 || $this->user->balance <= 0) {
			$this->bot->sendMessage([
				'chat_id' => $chatId,
				'text' => "Пополните баланс",
				'reply_markup' => $this->markup
			]);

			return;
		}

		// Проверяем спам
		$latestMessage = $this->user->messages()
			->orderByDesc('id')
			->first();
		if ($latestMessage) {
			if ($latestMessage->content == $text || $latestMessage->role == 'user') {
				return;
			}
		}

		$this->user->messages()->create([
			'content' => $text,
			'role' => 'user',
		]);

		$messages = $this->user->messages()
			->where('error_code', NULL)
			->orderByDesc('id')
			->get();
		$history = MessageController::getHistory($messages, 'gpt-3.5-turbo');
		$history = array_reverse($history);
		if (!$history) {
			$history = [
				['role' => 'user', 'content' => $text]
			];
		}

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
				$result = $client->chat()->create([
					'model' => $this->user->model,
					'messages' => $history,
					'max_tokens' => 2048,
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
			} elseif ($errorCode === 0) {
				ProxyController::setStatus($proxy, 2);
				break;
			}
			// Нужно дописать другие ошибки
		} while ($error && $token && $proxy);

		if ($error || !$result->choices[0]->message->content) {
			$text = "В данный момент невозможно обработать запрос. Ошибка: {$errorCode}";
		} else {
			$text = $result->choices[0]->message->content;

			$this->user->messages()->create([
				'content' => $result->choices[0]->message->content,
				'role' => 'assistant',
			]);

			// Пересчитываем баланс
			if ($this->webUser) {
				$user = $this->webUser;
			} else {
				$user = $this->user;
			}
			
			$user->decrement('quick', 1);
		}

		$this->bot->sendMessage([
			'chat_id' => $chatId,
			'text' => $text
		]);
	}
}
