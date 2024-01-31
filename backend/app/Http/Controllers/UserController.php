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
		if ($request->s) {
			$users = User::where('name', 'like', '%' . $request->s . '%')
				->orWhere('email', 'like', '%' . $request->s . '%')
				->orWhere('telegram_id', 'like', '%' . $request->s . '%')
				->get();

			$botUsers = \App\Models\Bot\User::where('web', 0)
				->where(function ($query) use ($request) {
					$query->where('name', 'like', '%' . $request->s . '%');
					$query->orWhere('telegram_id', 'like', '%' . $request->s . '%');
				})->get();
		} else {
			$users = User::get();

			$botUsers = \App\Models\Bot\User::where('web', 0)->get();
		}

		$combinedArray = array_merge($users->toArray(), $botUsers->toArray());

		return response()->json($combinedArray);
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

		if (!$data || now()->gt(Carbon::parse($data['expired']))) {
			return response()->json(['message' => 'Token expired'], 500);
		}

		$botUser = \App\Models\Bot\User::where('telegram_id', $data['telegram_id'])->first();

		$user->telegram_id = $data['telegram_id'];

		$botUser->web = 1;

		$user->save();
		$botUser->save();

		return 'Профиль успешно привязан, вы можете вернуться в Telegram';
	}

	public function addQuick(Request $request, $id)
	{
		if ($request->telegram) {
			$currentUser = \App\Models\Bot\User::find($id);
		} else {
			$currentUser = User::find($id);
		}

		if (!$currentUser) {
			return response()->json(['message' => 'User not found'], 500);
		}

		$currentUser->quick += $request->quick;
		//$currentUser->level = 2;
		$currentUser->save();

		return response()->json(['message' => 'Quick updated successfully']);
	}

	public function setLevel(Request $request, $id)
	{
		if ($request->telegram) {
			$currentUser = \App\Models\Bot\User::find($id);
		} else {
			$currentUser = User::find($id);
		}

		if (!$currentUser) {
			return response()->json(['message' => 'User not found'], 500);
		}

		if ($request->level === 2) {
			$currentUser->level = 2;
			$currentUser->quick += 700;
		} elseif ($request->level === 3) {
			$currentUser->level = 3;
			$currentUser->quick += 1500;
		} else {
			return response()->json(['message' => 'Level not found'], 500);
		}

		$currentUser->paid_at = now();

		$currentUser->save();

		return response()->json(['message' => 'Level set successfully']);
	}
}
