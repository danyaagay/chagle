<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Controllers\StreamsController;
use App\Models\User;
use App\Models\Token;
use App\Models\Message;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('super-admin')) {
            $userCount = User::count();
            $tokenCount = Token::count();
            $messageCount = Message::count();

            return response()->json([
                [ 'title' => 'Клиенты', 'value' => $userCount ],
                [ 'title' => 'Сообщения', 'value' => $messageCount ],
                [ 'title' => 'Токены', 'value' => $tokenCount ],
            ]);
        } else {
            return response()->json([
                'error' => 'Undefined',
            ], 400);
        }
    }
}
