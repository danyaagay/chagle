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
    public function index(Request $request, $id)
    {
        $user = $request->user();

        $dialog = $user->dialogs()->where('id', $id)->first();

        if ($dialog) {
            //$messages = $dialog->messages()->select('created_at', 'text', 'role')->get();
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

                $formattedMessage['time'] = $date->format('g:i');
                $formattedMessage['text'] = $message->text;
                $formattedMessage['id'] = $message->id;

                $formattedMessages[] = $formattedMessage;
            }

            return response()->json([
                'messages' => $formattedMessages,
            ]);
        } else {
            return response()->json([
                'error' => 'Dialog not found',
            ], 400);
        }
    }

    public function store(Request $request, $id)
    {
        $user = $request->user();

        if ($id) {
            $dialog = $user->dialogs()->where('id', $id)->first();
            if (!$dialog) {
                return response()->json([
                    'error' => 'Unknown error',
                ]);
            }
            $dialog->messages()->create([
                'text' => $request->text,
                'role' => 'user',
            ]);
            return true;
        } elseif (!$id) {
            $dialog = $user->dialogs()->create([
                'title' => $request->text,
            ]);
            $dialog->messages()->create([
                'text' => $request->text,
                'role' => 'user',
            ]);
            return true;
        } else {
            return response()->json([
                'error' => 'Unknown error',
            ], 400);
        }
    }
}
