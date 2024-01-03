<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\Registered;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AuthController extends Controller
{
    // signup a new user method
    public function signup(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'balance' => '20',
        ]);

        event(new Registered($user));

        $token = $user->createToken('auth_token', ['*'], Carbon::now()->addDay(2))->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24 * 365); // one year

        return response()->json([
            'user' => new UserResource($user),
        ])->withCookie($cookie);
    }

    // login a user method
    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        if (Auth::attempt($data)) {
            /** @var \App\Models\User $user **/
            $user = Auth::user();

            $token = $user->createToken('auth_token', ['*'], Carbon::now()->addDay(2))->plainTextToken;

            $cookie = cookie('token', $token, 60 * 24 * 365); // one year
    
            return response()->json([
                'user' => new UserResource($user),
            ])->withCookie($cookie);
        }

        return response()->json([
            'message' => 'Email или пароль указан неверно'
        ], 401);
    }

    // logout a user method
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        $cookie = cookie()->forget('token');

        return response()->json([
            'message' => 'Logged out successfully!'
        ])->withCookie($cookie);
    }

    // get the authenticated user method
    public function user(Request $request)
    {
        $user = $request->user();
    
        if( $user ):            
            $token = $user->currentAccessToken();
            $token->forceFill([
                'expires_at' => Carbon::now()->addDay(2)
            ])->save();
        endif;

        return new UserResource($user);
    }
}
