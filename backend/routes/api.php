<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TokenController;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::group(['middleware' => ['role:super-admin']], function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/tokens', [TokenController::class, 'index']);
        Route::post('/tokens', [TokenController::class, 'store']);
        Route::delete('/tokens/{id}', [TokenController::class, 'destroy']);
        Route::get('/summary/{type}', [SummaryController::class, 'index']);
        Route::post('/balance/{id}', [UserController::class, 'addBalance']);
    });
    
    Route::middleware('verified')->group(function () {
        Route::get('/chats', [ChatController::class, 'index']);
        Route::patch('/chats/{id}', [ChatController::class, 'update']);
        Route::patch('/chats/{id}/settings/update', [ChatController::class, 'settingsUpdate']);
        Route::delete('/chats/{id}', [ChatController::class, 'destroy']);
        Route::get('/messages/{id}', [MessageController::class, 'index']);
        Route::post('/messages/{id?}', [MessageController::class, 'store']);
        Route::post('/messages/regenerate/{id}', [MessageController::class, 'regenerate']);
        Route::post('/messages-cancel', [MessageController::class, 'cancel']);
        Route::post('/settings-update', [SettingController::class, 'update']);
    });

    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verify/resend', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent!']);
    })->middleware(['throttle:1,1'])->name('verification.send');

});

// Сброс пароля

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);
 
    $status = Password::sendResetLink(
        $request->only('email')
    );
 
    return response()->json(['status' => $status === Password::RESET_LINK_SENT ? __($status) : null, 'errors' => $status !== Password::RESET_LINK_SENT ? ['email' => __($status)] : null]);
});

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);
 
    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));
 
            $user->save();
 
            event(new PasswordReset($user));
        }
    );
 
    return response()->json(['status' => $status === Password::PASSWORD_RESET ? __($status) : null, 'errors' => $status !== Password::PASSWORD_RESET ? ['email' => __($status)] : null]);
});


// Вход и регистрация через поставщика Google

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
});