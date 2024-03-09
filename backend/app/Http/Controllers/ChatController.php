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

		$chats = $user->chats()
			->orderBy('used_at', 'desc')
			->skip($request->offset)
			->take(20)
			->get()
			->toArray();

		//$messagesReverse = array_reverse($messages);

		if ($user->chats()->orderBy('used_at', 'desc')->count() > $request->offset + 20) {
			$hasMore = true;
		} else {
			$hasMore = false;
		}

		return response()->json([
			'chats' => $chats,
			'hasMore' => $hasMore
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
		$validatedData = $request->validate([
			'system_message' => 'max:255',
			'history' => 'in:0,1',
			'max_tokens' => 'in:500,2048,4096',
			'model' => 'string|in:gpt-3.5-turbo,gpt-3.5-turbo-16k,gpt-4,gpt-4-32k,gpt-4-turbo-preview',
		]);
		
		$user = $request->user();

		$chat = $user->chats()->find($id);

		if (!$chat) {
			return response()->json([
				'error' => 'Chat not found',
			], 500);
		}

		if (!$request->filled('system_message')) {
			$validatedData['system_message'] = '';
		}

		$chat->update($validatedData);

		return $validatedData;
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
