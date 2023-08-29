<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SettingRequest;
use App\Http\Resources\UserResource;
use App\Http\Requests\SettingUpdatePasswordRequest;

class SettingController extends Controller
{
    public function update(SettingRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $user->fill($data);
        $user->save();

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }
}
