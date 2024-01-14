<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VerifyEmailController;

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\UserResource;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::get('/auth/redirect', function () {
    return response()->json([
        'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
    ]);
});

Route::get('/auth/callback', function () {
    $googleuUser = Socialite::driver('google')->stateless()->user();

    //$avatarContents = file_get_contents($googleuUser->picture);
    //$avatarName = uniqid('avatar_') . '.jpg';
    //Storage::disk('public')->put($avatarName, $avatarContents);

    $user = User::firstOrCreate(
        ['email' =>  $googleuUser->email],
        [
            'name' => $googleuUser->name,
            'avatar' => $googleuUser->avatar,
            'balance' => '20',
            'free' => 1
        ]
    );

    $token = $user->createToken('auth_token', ['*'], now()->addDay(2))->plainTextToken;

    $cookie = cookie('token', $token, 60 * 24 * 365); // one year

    Auth::login($user);

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    return response()->json([
        'user' => new UserResource($user),
    ])->withCookie($cookie);

    // $user->token
});
