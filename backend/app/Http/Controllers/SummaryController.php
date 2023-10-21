<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Controllers\StreamsController;
use App\Models\User;
use App\Models\Token;
use App\Models\Message;

class SummaryController extends Controller
{
    public function index(Request $request, $type)
    {
        $user = $request->user();

        if ($user->hasRole('super-admin')) {
            if ($type === 'all') {
                $userCount = User::count();
                $tokenCount = Token::count();
                $messageCount = Message::count();
    
                return response()->json([
                    [ 'title' => 'Клиенты', 'value' => $userCount ],
                    [ 'title' => 'Сообщения', 'value' => $messageCount ],
                    [ 'title' => 'Токены', 'value' => $tokenCount ],
                ]);
            } elseif ($type === 'users') {
                $userCount = User::count();
                $messageCount = Message::count();
    
                return response()->json([
                    [ 'title' => 'Клиенты', 'value' => $userCount ],
                    [ 'title' => 'Сообщения', 'value' => $messageCount ],
                ]);
            } elseif ($type === 'tokens') {
                $tokenCount = Token::count();
    
                return response()->json([
                    [ 'title' => 'Токены', 'value' => $tokenCount ],
                ]);
            }
        } else {
            return response()->json([
                'error' => 'Undefined',
            ], 400);
        }
    }
}
