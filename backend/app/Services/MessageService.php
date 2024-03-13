<?php

namespace App\Services;

class MessageService
{
    public function create($chat, $text, $role, $errorCode = NULL)
    {
        $message = $chat->messages()->create([
            'content' => $text,
            'role' => $role,
            'error_code' => $errorCode ?? NULL,
            'model' => $chat->model
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

    public function update($message, $text, $errorCode = false)
    {
        $message->update([
            'content' => $text,
            'error_code' => $errorCode ?? NULL
        ]);
    }

    public function getHistory($chat, $lastMessageId = false, $text)
    {
        if ($chat->history) {
            $messagesQuery = $chat->messages()
                ->where('error_code', NULL)
                ->orderByDesc('id');

            if ($lastMessageId) {
                $messagesQuery->whereNot('id', $lastMessageId);
            }

            $messages = $messagesQuery->get();

            $array = [];
            if ($chat->model === 'gpt-3.5-turbo') {
                $contextSize = 4095;
            } elseif ($chat->model === 'gpt-3.5-turbo-16k') {
                $contextSize = 16383;
            } elseif ($chat->model === 'gpt-4') {
                $contextSize = 8191;
            } elseif ($chat->model === 'gpt-4-32k') {
                $contextSize = 32767;
            } elseif ($chat->model === 'gpt-4-turbo-preview') {
                $contextSize = 128000;
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

        return $history;
    }
}

?>