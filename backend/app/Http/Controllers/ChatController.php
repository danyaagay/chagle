<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SettingRequest;
use App\Http\Resources\UserResource;
use App\Models\Chat;
use App\Http\Requests\SettingUpdatePasswordRequest;

class ChatController extends Controller
{
	public function index(Request $request)
	{
		$user = $request->user();

		$chats = $user->chats()->orderBy('updated_at', 'desc')->take(20)->get();

		return response()->json([
			'chats' => $chats,
		]);
	}

	public function update(Request $request, $id)
	{
		$user = $request->user();

		$chat = $user->chats()->find($id);

		if (!$chat) {
			return response()->json([
				'error' => 'Chat not found',
			], 500);
		}

		$chat->title = $request->title;

		$chat->save();

		return true;
	}

	public function settingsUpdate(Request $request, $id)
	{
		$user = $request->user();

		$chat = $user->chats()->find($id);

		if (!$chat) {
			return response()->json([
				'error' => 'Chat not found',
			], 500);
		}

		$data = $request->all();

		if (!$request->filled('system_message')) {
			$data['system_message'] = '';
		}

		$chat->update($data);

		return $data;
	}

	public function destroy(Request $request, $id)
	{
		$user = $request->user();

		$chat = $user->chats()->find($id);

		if (!$chat) {
			return response()->json([
				'error' => 'Chat not found',
			], 500);
		}

		$chat->delete();

		return true;
	}
}
