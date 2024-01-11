<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Http\Controllers\StreamsController;
use Carbon\Carbon;

class MessageController extends Controller
{
    private $result;

    public function messageFormatting($messages)
    {
        $formattedMessages = [];
        $currentDate = null;
        foreach ($messages as $message) {
            $formattedMessage = [];

            if ($message->role === 'user') {
                $formattedMessage['you'] = true;
            }

            $date = Carbon::parse($message->created_at);

            $currentDate = $date;

            $formattedMessage['date'] = $date;
            $formattedMessage['time'] = $date->format('g:i');
            $formattedMessage['text'] = $message->content;
            $formattedMessage['id'] = $message->id;
            $formattedMessage['is_error'] = $message->error_code === NULL ? false : true;

            $formattedMessages[] = $formattedMessage;
        }

        $formattedMessages = array_reverse($formattedMessages);

        return $formattedMessages;
    }

    public function index(Request $request, $id)
    {
        $user = $request->user();

        $chat = $user->chats()->where('id', $id)->first();

        if ($chat) {
            $messages = $chat->messages()->orderBy('id', 'desc')->skip($request->offset)->take(30)->get();
            if ($chat->messages()->orderBy('id', 'desc')->count() > $request->offset + 30) {
                $hasMore = true;
            } else {
                $hasMore = false;
            }
            //$hasMore = $messages->hasMorePages();
            //$messages = $chat->messages;
            $messages = $this->messageFormatting($messages);
         

            return response()->json([
                'messages' => $messages,
                'hasMore' => $hasMore
            ]);
        } else {
            return response()->json([
                'error' => 'Chat not found',
            ], 400);
        }
    }

    public function store(Request $request, $id = false)
    {
        $user = $request->user();

        return response()->stream(function () use ($user, $request, $id) {
            if ($user->balance <= 0) {
                $text = "Пополните баланс";
        
                $json = json_encode(['message' => $text, 'error' => true]);

                echo 'data: ' . $json . "\n\n";
                flush(); ob_end_flush();

                return false;
            }

            if ($id) {
                $chat = $user->chats()->find($id);
            } else {
                $chat = $user->chats()->create([
                    'title' => mb_substr($request->text, 0, 255),
                ]);
            }

            if (!$chat) {
                return response()->json([
                    'error' => 'Unknown error 1',
                ]);
            }

            $message = $chat->messages()->create([
                'content' => $request->text,
                'role' => 'user',
            ]);

            $messages = $chat->messages()
                ->where('error_code', NULL)
                ->orderByDesc('id')
                ->get();

            $history = $this->getHistory($messages, $chat->model);

            $history = array_reverse($history);

            $settings = [
                'model' => $chat->model,
                'system_message' => $chat->system_message,
                'temperature' => $chat->temperature,
                'max_tokens' => $chat->max_tokens,
                'top_p' => $chat->top_p,
                'frequency_penalty' => $chat->frequency_penalty,
                'presence_penalty' => $chat->presence_penalty,
            ];

            $answer = StreamsController::stream($request->text, $history, $settings);

            if ($answer['error']) {
                $chatAnswer = $chat->messages()->create([
                    'content' => $answer['answer'],
                    'role' => 'assistant',
                    'error_code' => $answer['error_code']
                ]);
            } else {
                $chatAnswer = $chat->messages()->create([
                    'content' => $answer['answer'],
                    'role' => 'assistant',
                ]);

                $newBalance = $this->calculate($history, $user->balance, $request->text, $answer['answer'], $chat->model);
                $user->balance = $newBalance;
                $user->save();
            }

            echo 'data: {"answerId":"' . $chatAnswer->id . '"}' . "\n\n";

            echo 'data: {"messageId":"' . $message->id . '"}' . "\n\n";

            if (!$id) {
                echo 'data: {"chatId":"' . $chat->id . '"}' . "\n\n";
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function regenerate(Request $request, $id)
    {
        $user = $request->user();

        return response()->stream(function () use ($user, $request, $id) {
            if ($user->balance <= 0) {
                $text = "Пополните баланс";

                $json = json_encode(['message' => $text, 'error' => true]);

                echo 'data: ' . $json . "\n\n";
                flush(); ob_end_flush();
                
                return false;
            }
            
            $chat = $user->chats()->find($id);

            if (!$chat) {
                return response()->json([
                    'error' => 'Unknown error 1',
                ]);
            }

            $lastMessages = $chat->messages()->orderBy('id', 'desc')->limit(2)->get();

            if ($lastMessages[1]->role != 'user' || $lastMessages[0]->role != 'assistant') {
                return response()->json([
                    'error' => 'Unknown error 2',
                ]);
            }

            $messages = $chat->messages()
                ->where('error_code', NULL)
                ->whereNot('id', $lastMessages[0]->id)
                ->orderByDesc('id')
                ->get();

            $history = $this->getHistory($messages, $chat->model);

            $history = array_reverse($history);

            $settings = [
                'model' => $chat->model,
                'system_message' => $chat->system_message,
                'temperature' => $chat->temperature,
                'max_tokens' => $chat->max_tokens,
                'top_p' => $chat->top_p,
                'frequency_penalty' => $chat->frequency_penalty,
                'presence_penalty' => $chat->presence_penalty,
            ];

            $answer = StreamsController::stream($lastMessages[1]->text, $history, $settings);

            if ($answer['error']) {
                $chatAnswer = $lastMessages[0]->update([
                    'content' => $answer['answer'],
                    'error_code' => $answer['error_code']
                ]);
            } else {
                $chatAnswer = $lastMessages[0]->update([
                    'content' => $answer['answer'],
                    'error_code' => NULL
                ]);
                
                $newBalance = $this->calculate($history, $user->balance, $request->text, $answer['answer'], $chat->model);
                $user->balance = $newBalance;
                $user->save();
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
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
        if ($model === 'gpt-3.5-turbo-16k') {
            $contextSize = 16383;
        } else {
            $contextSize = 4095;
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

        return $array;
    }

    public static function calculate($history, $balance, $question, $answer, $model)
    {
        if (!$history) {
            $history = [
                ['role' => 'user', 'content' => $question]
            ];
        }

        $text = '';

        foreach($history as $history) {
            $text .= $history['content'];
        }

        $text .= $answer;

        $text = str_replace(" ", "", $text);
      
        // Считаем количество токенов
        $tokenCount = ceil(mb_strlen($text) / 2);
      
        // Рассчитываем стоимость
        if ($model === 'gpt-3.5-turbo-16k') {
            $pricePerTokens = 0.4;
        } else {
            $pricePerTokens = 0.2;
        }
        $pricePerToken = $pricePerTokens / 1000;
        $cost = $tokenCount * $pricePerToken;
      
        // Вычитаем стоимость из баланса
        $balance -= $cost;

        return $balance;
    }
}