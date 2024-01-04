<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Token;

class TokenController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('super-admin')) {
            $tokens =  Token::get();
            return response()->json($tokens);
        } else {
            return response()->json([
                'error' => 'Undefined',
            ], 400);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('super-admin')) {
            $token = Token::create([
                'token' => $request->token,
                'status' => 1,
            ]);
            return response()->json($token);
        } else {
            return response()->json([
                'error' => 'Undefined',
            ], 400);
        }
    }

    public function update(Request $request, $id)
    {
        
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->hasRole('super-admin')) {
            $token = Token::find($id);
            $token->delete();
            return true;
        } else {
            return response()->json([
                'error' => 'Undefined',
            ], 400);
        }
    }

    public static function getToken()
    {
        //Внимание! Нужно перенести в фоновый процесс!
        //self::checkTokens();

        $token = Token::where('status', 1)
        ->where('limit', '>', 0)
        ->orderBy('updated_at', 'desc')
        ->first();

        if ($token) {
            $token->decrement('limit');
        }

        return $token;
    }

    public static function setStatus($token, $status)
    {
        $token->status = $status;
        $token->save();
    }

    //public static function checkTokens()
    //{
    //    $tokens = Token::where('status', 2)->get();
    //    foreach ($tokens as $token) {
    //        $updatedAt = strtotime($token->updated_at);
    //        $currentTime = time();
    //        $tenMinutesAgo = strtotime('-10 minutes', $currentTime);
    //    
    //        if ($updatedAt < $tenMinutesAgo) {
    //            $token->status = 1;
    //            $token->save();
    //        }
    //    }
    //}
}
