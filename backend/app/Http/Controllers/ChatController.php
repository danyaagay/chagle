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

        $chats = $user->chats;

        return response()->json([
            'chats' => $chats,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $chat = $user->chats()->find($id);

        $chat->title = $request->title;

        $chat->save();

        return true;
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $chat = $user->chats()->find($id);

        $chat->delete();

        return true;
    }
}
