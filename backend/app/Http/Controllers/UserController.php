<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Bot\Connection;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

class UserController extends Controller
{
	public function index(Request $request)
	{
		$users = User::get()->concat(\App\Models\Bot\User::where('web', 0)->get());
		return response()->json($users);
	}

	public function update(Request $request, $id)
	{
	}

	public function destroy(Request $request, $id)
	{
	}

	public function connectionTelegram(Request $request, $token)
	{
		$user = $request->user();

		if (!$user) {
			return response()->json(['message' => 'User not found'], 500);
		}

		$data = Crypt::decryptString($token);
		$data = unserialize($data);

		if(!$data || now()->gt(Carbon::parse($data['expired']))) {
			return response()->json(['message' => 'Token expired'], 500);
		}

		$botUser = \App\Models\Bot\User::where('telegram_id', $data['telegram_id'])->first();

		$user->telegram_id = $data['telegram_id'];

		$botUser->web = 1;

		$user->save();
		$botUser->save();

		return 'Профиль успешно привязан, вы можете вернуться в Telegram';
	}

	public function addBalance(Request $request, $id)
	{
		$currentUser = User::find($id);

		if (!$currentUser) {
			return response()->json(['message' => 'User not found'], 500);
		}

		$currentUser->balance += $request->balance;
		$currentUser->level = 2;
		$currentUser->save();

		return response()->json(['message' => 'Balance updated successfully']);
	}
}
