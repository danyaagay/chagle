<?php

namespace App\Services;

use App\Models\Bot\User;
use OpenAI;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\ProxyController;
use Illuminate\Support\Facades\Crypt;

use Telegram\Bot\Laravel\Facades\Telegram;

use App\Services\UserService;
use App\Services\MessageService;
use App\Services\StreamService;

class BotService
{
    public function __construct(private UserService $userService, private MessageService $messageService, private StreamService $streamService)
    {
    }

    // Используемые глобальные переменные
    public $update, $bot, $markup, $model, $user, $webUser;
    public $commands = [
        'profile' => ['профиль'],
        'billing' => ['пополнить баланс'],
        'new' => ['новый чат'],
        'connect' => ['привязать аккаунт chagle'],
        'change' => ['изменить модель', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
        'start' => ['/start', 'тест']
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
                'balance' => '2',
                'level' => 1,
                'model' => 'gpt-3.5-turbo'
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
Баланс ' . $user->balance . ' ✨
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
						
🚀 Цены:
						
Бесплатно (2 ✨)
ChatGPT 3.5, Claude Instant, Gemini Pro
			
Базовый 199 ₽ (200 ✨)
ChatGPT 3.5, Claude Instant, Gemini Pro
ChatGPT 4, Claude 2
			
Премиум 299 ₽ (300 ✨)
ChatGPT 3.5, Claude Instant, Gemini Pro
ChatGPT 4, Claude 2
			
✨ это виртуальная валюта Chagle, 1₽ = 1✨
Оплата происходит за использование, без абонентской платы и сгорания токенов.
						
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

        if ($this->webUser && $this->webUser->level < 1 || $this->user->level < 1) {
            $this->bot->sendMessage([
                'chat_id' => $chatId,
                'text' => 'В данный момент невозможно обработать запрос. Ошибка: 1',
                'reply_markup' => $this->markup
            ]);
            
            return;
        }

        // Проверяем баланс
        if ($this->webUser && $this->webUser->balance <= 0 || $this->user->balance <= 0) {
            $this->bot->sendMessage([
                'chat_id' => $chatId,
                'text' => 'Пополните баланс',
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

        $this->messageService->create($this->user, $text, 'user');

        $history = $this->messageService->getHistory($this->user, false, $text);

        $result = $this->streamService->execute('create', $this->user->model, $history, 2048);

        if ($result['error'] || !$result['result']->choices[0]->message->content) {
            $text = "В данный момент невозможно обработать запрос. Ошибка: {$result['errorCode']}";

            $this->messageService->errorNoticeAdmin($text);
        } else {
            $text = $result['result']->choices[0]->message->content;

            $this->messageService->create($this->user, $text, 'assistant');

            // Пересчитываем баланс
            $user = $this->webUser ?? $this->user;

            $this->userService->balanceDown($history, $user, $text, $user->model, false);
        }

        $this->bot->sendMessage([
            'chat_id' => $chatId,
            'text' => $text
        ]);
    }
}
