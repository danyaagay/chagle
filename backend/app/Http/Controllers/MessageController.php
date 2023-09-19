<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SettingRequest;
use App\Http\Resources\UserResource;
use App\Models\Dialog;
use App\Models\Message;
use App\Http\Requests\SettingUpdatePasswordRequest;
use Carbon\Carbon;

class MessageController extends Controller
{
    public function openAi($text) {
        //return 'answer';

        header('Access-Control-Allow-Origin: http://192.168.0.116:5173');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: *');
        
        $tokens = [
            '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',
            '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'
        ];

        $json = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => $text]
            ],
            'stream' => true,
            'max_tokens' => 1024,
        ];

        $ch = curl_init();

        curl_setopt_array($ch, array(
            CURLOPT_URL => 'https://api.openai.com/v1/chat/completions',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($json, JSON_UNESCAPED_UNICODE),
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer {$tokens[1]}",
                'Content-Type: application/json'
            ]
        ));

        $answer = '11';
        $obj = $this;
        $this->result = '';
        $callback = function ($ch, $data) use ($obj) {
            $lines = explode("\n\n", $data);
            $lines = array_diff($lines, array(null));
            $parsedLines = array_map(function ($line) {
                return json_decode(trim(str_replace('data: ', '', $line)), true);
            }, $lines);
            
            foreach ($parsedLines as $parsedLine) {
                @$choices = $parsedLine['choices'];
                @$delta = $choices[0]['delta'];
                @$content = $delta['content'];
                
                if ($content) {
                    $obj->result .= $content;

                    $json = [];
                    $json['message'] = $obj->result;
                    $json = json_encode($json);
                    
                    echo $json."\n";
                }
            }
            
            //if (strlen($data) > 5) {
            //    echo $data;
            //}
            return strlen($data);
        };

        curl_setopt($ch, CURLOPT_WRITEFUNCTION, $callback);
    
        curl_exec($ch);
        return $this->result;
        //$response = json_decode($response);
    
        //if (!isset($response->error)) {
        //    return $response->choices[0]->message->content;
        //} else {
        //    return $response->error->message;
        //}
    }

    public function getAllMessages($dialog) {
        $messages = $dialog->messages;

        $formattedMessages = [];
        $currentDate = null;
        foreach ($messages as $message) {
            $formattedMessage = [];

            if ($message->role === 'user') {
                $formattedMessage['you'] = true;
            }

            $date = Carbon::parse($message->created_at);

            if (!$currentDate || !$date->isSameDay($currentDate)) {
                $date = Carbon::parse($message->created_at);
                $now = Carbon::now();

                if ($date->isToday()) {
                    $formattedDate = 'Сегодня';
                } elseif ($date->isYesterday()) {
                    $formattedDate = 'Вчера';
                } else {
                    if ($date->year !== $now->year) {
                        $formattedDate = $date->locale('ru')->isoFormat('D MMMM YYYY');
                    } else {
                        $formattedDate = $date->locale('ru')->isoFormat('D MMMM');
                    }
                }

                $formattedMessage['marker'] = $formattedDate;
            }

            $currentDate = $date;

            $formattedMessage['date'] = $date;
            $formattedMessage['time'] = $date->format('g:i');
            $formattedMessage['text'] = $message->text;
            $formattedMessage['id'] = $message->id;

            $formattedMessages[] = $formattedMessage;
        }

        return $formattedMessages;
    }
    
    public function index(Request $request, $id)
    {
        $user = $request->user();

        $dialog = $user->dialogs()->where('id', $id)->first();

        if ($dialog) {
            $messages = $this->getAllMessages($dialog);

            return response()->json([
                'messages' => $messages,
            ]);
        } else {
            return response()->json([
                'error' => 'Dialog not found',
            ], 400);
        }
    }

    public function store(Request $request, $id = false)
    {
        $user = $request->user();

        if ($id) {
            $dialog = $user->dialogs()->where('id', $id)->first();
            if (!$dialog) {
                return response()->json([
                    'error' => 'Unknown error',
                ]);
            }
            $message = $dialog->messages()->create([
                'text' => $request->text,
                'role' => 'user',
            ]);

            $answer = $this->openAi($request->text);

            $answer = $dialog->messages()->create([
                'text' => $answer,
                'role' => 'assistant',
            ]);
            
            //$messages = $this->getAllMessages($dialog);
            return response()->json([
                'message' => $message,
                'answer' => $answer,
            ]);
        } elseif (!$id) {
            $dialog = $user->dialogs()->create([
                'title' => $request->text,
            ]);
            $message = $dialog->messages()->create([
                'text' => $request->text,
                'role' => 'user',
            ]);

            $answer = $this->openAi($request->text);
            $answer = $dialog->messages()->create([
                'text' => $answer,
                'role' => 'assistant',
            ]);

            //$messages = $this->getAllMessages($dialog);
            return response()->json([
                'message' =>  $message,
                'answer' => $answer,
                'dialog' => $dialog,
            ]);
        } else {
            return response()->json([
                'error' => 'Unknown error',
            ], 400);
        }
    }
}
