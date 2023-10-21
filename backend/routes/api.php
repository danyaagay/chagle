<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\StreamsController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TokenController;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

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

//Route::get('/stream', [StreamsController::class, 'stream']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/tokens', [TokenController::class, 'index']);
    Route::post('/tokens', [TokenController::class, 'store']);

    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/chats', [ChatController::class, 'index']);
    Route::patch('/chats/{id}', [ChatController::class, 'update']);
    Route::delete('/chats/{id}', [ChatController::class, 'destroy']);
    Route::get('/messages/{id}', [MessageController::class, 'index']);
    Route::post('/messages/{id?}', [MessageController::class, 'store']);
    Route::post('/messages-cancel', [MessageController::class, 'cancel']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/settings-update', [SettingController::class, 'update']);

    Route::get('/Crr183gJkwKQwkC3jE9N', [AdminController::class, 'index']);

    Route::post('/email/verify/resend', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent!']);
    })->middleware(['throttle:1,1'])->name('verification.send');

});

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