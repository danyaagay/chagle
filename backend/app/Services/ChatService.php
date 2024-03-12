<?php

namespace App\Services;

class ChatService
{
    public function createOrFind($user, $id, $title)
    {
        $chat = $id ? $user->chats()->find($id) : $user->chats()->create([
            'title' => mb_substr($title, 0, 255),
            'used_at' => now(),
        ]);

        return $chat;
    }

    public function subTitleUpdate($chat, $title)
    {
        $chat->update([
            'sub_title' => mb_substr($title, 0, 255),
            'used_at' => now()
        ]);
    }
}
