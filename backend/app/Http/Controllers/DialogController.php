<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SettingRequest;
use App\Http\Resources\UserResource;
use App\Models\Dialog;
use App\Http\Requests\SettingUpdatePasswordRequest;

class DialogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $dialogs = $user->dialogs;

        return response()->json([
            'dialogs' => $dialogs,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $dialog = $user->dialogs()->find($id);

        $dialog->delete();

        return true;
    }
}
