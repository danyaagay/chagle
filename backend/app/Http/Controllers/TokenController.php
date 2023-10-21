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
                'alive' => 1,
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
}
