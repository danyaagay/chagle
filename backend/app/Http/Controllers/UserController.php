<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('super-admin')) {
            $users =  User::get();

            return response()->json($users);
        } else {
            return response()->json([
                'error' => 'Undefined',
            ], 400);
        }
    }

    public function update(Request $request, $id)
    {
        
    }

    public function destroy(Request $request, $id)
    {

    }
}
