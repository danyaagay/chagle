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
        try {
            $user = $request->user();
    
            $chat = $user->chats()->find($id);
    
            if (!$chat) {
                throw new \Exception("Chat not found");
            }
    
            $chat->title = $request->title;
    
            $chat->save();
    
            return true;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function settingsUpdate(Request $request, $id)
    {
        try {
            $user = $request->user();

            $chat = $user->chats()->find($id);
    
            if (!$chat) {
                throw new \Exception("Chat not found");
            }

            $data = $request->all();

            if (!$request->filled('system_message')) {
                $data['system_message'] = '';
            }
    
            $chat->update($data);
    
            return $data;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();

            $chat = $user->chats()->find($id);
    
            if (!$chat) {
                throw new \Exception("Chat not found");
            }
    
            $chat->delete();
    
            return true;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
