<?php

namespace App\Services;

use Telegram\Bot\Laravel\Facades\Telegram;

class MessageService
{
    // user for support bot telegram (without chats)
    public function create($chatOrUser, $text, $role, $errorCode = null)
    {
        $message = $chatOrUser->messages()->create([
            'content' => $text,
            'role' => $role,
            'error_code' => $errorCode,
            'model' => $chatOrUser->model
        ]);

        return $message;
    }

    public function getLasts($chat)
    {
        $lastMessages = $chat->messages()->orderBy('id', 'desc')->limit(2)->get();

        if ($lastMessages[1]->role != 'user' || $lastMessages[0]->role != 'assistant') {
            return false;
        }

        return $lastMessages;
    }

    public function update($message, $text, $errorCode = null)
    {
        $message->update([
            'content' => $text,
            'error_code' => $errorCode
        ]);
    }

    public function getHistory($chatOrUser, $lastMessageId = false, $text)
    {
        if ($chatOrUser->history || !isset($chatOrUser->history)) {
            $messagesQuery = $chatOrUser->messages()
                ->where('error_code', NULL)
                ->orderByDesc('id');

            if ($lastMessageId) {
                $messagesQuery->whereNot('id', $lastMessageId);
            }

            $messages = $messagesQuery->get();

            $array = [];
            if ($chatOrUser->model === 'gpt-3.5-turbo') {
                $contextSize = 4095;
            } elseif ($chatOrUser->model === 'gpt-3.5-turbo-16k') {
                $contextSize = 16383;
            } elseif ($chatOrUser->model === 'openai/gpt-4') {
                $contextSize = 8191;
            } elseif ($chatOrUser->model === 'openai/gpt-4-32k') {
                $contextSize = 32767;
            } elseif ($chatOrUser->model === 'openai/gpt-4-turbo-preview') {
                $contextSize = 128000;
            } elseif ($chatOrUser->model === 'anthropic/claude-instant-1') {
                $contextSize = 100000;
            } elseif ($chatOrUser->model === 'anthropic/claude-3-opus') {
                $contextSize = 200000;
            } elseif ($chatOrUser->model === 'anthropic/claude-3-haiku') {
                $contextSize = 200000;
            } elseif ($chatOrUser->model === 'google/gemini-pro') {
                $contextSize = 131040;
            }
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

            $history = array_reverse($array);
        } else {
            $history = [['role' => 'user', 'content' => $text]];
        }

        if (isset($chatOrUser->system_message) && $chatOrUser->system_message) {
            array_unshift($history, ['role' => 'system', 'content' => $chatOrUser->system_message]);
        }

        return $history;
    }

    public function errorNoticeAdmin($text)
    {
		$bot = Telegram::bot();
        $bot->sendMessage([
			'chat_id' => 629799294,
			'text' => "Произошла ошибка
$text"
		]);
    }
}

?>