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
            if ($id) {
                $chat = $user->chats()->find($id);
            } else {
                $chat = $user->chats()->create([
                    'title' => $request->text,
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

            $history = $this->getHistory($chat->messages()->get());

            $stream = new StreamsController;
            $answer = $stream->stream($request->text, $history);

            $chatAnswer = $chat->messages()->create([
                'content' => $answer,
                'role' => 'assistant',
            ]);

            echo 'data: {"answerId":"' . $chatAnswer->id . '"}';
            echo "\n\n";

            echo 'data: {"messageId":"' . $message->id . '"}';
            echo "\n\n";

            if (!$id) {
                echo 'data: {"chatId":"' . $chat->id . '"}';
                echo "\n\n";
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

    public static function getHistory($messages)
    {
        $array = [];
        foreach ($messages as $message) {
            $array[] = ['role' => $message->role, 'content' => $message->content];
        }

        return $array;
    }
}
