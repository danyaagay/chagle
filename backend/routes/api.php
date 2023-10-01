<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\DialogController;
use App\Http\Controllers\MessageController;

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

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dialogs', [DialogController::class, 'index']);
    Route::patch('/dialogs/{id}', [DialogController::class, 'update']);
    Route::delete('/dialogs/{id}', [DialogController::class, 'destroy']);
    Route::get('/messages/{id}', [MessageController::class, 'index']);
    Route::post('/messages/{id?}', [MessageController::class, 'store']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/settings-update', [SettingController::class, 'update']);

    Route::post('/email/verify/resend', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent!']);
    })->middleware(['throttle:6,1'])->name('verification.send');

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