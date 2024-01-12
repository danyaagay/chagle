<?php

namespace App\Http\Controllers;

use App\Http\Requests\SettingRequest;
use App\Http\Resources\UserResource;

class SettingController extends Controller
{
    public function update(SettingRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if (!$user) {
			return response()->json([
				'error' => 'User not found',
			], 500);
		}

        $user->fill($data);
        $user->save();

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }
}
