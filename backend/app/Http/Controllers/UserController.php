<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::get();
        return response()->json($users);

    }

    public function update(Request $request, $id)
    {
        
    }

    public function destroy(Request $request, $id)
    {

    }

    public function addBalance(Request $request, $id)
    {
        $currentUser = User::find($id);
        
        if ($currentUser) {
            $currentUser->balance += $request->balance;
            $currentUser->save();
            
            return response()->json(['message' => 'Balance updated successfully']);
        }
        
        return response()->json(['message' => 'User not found'], 404);
    }
}
