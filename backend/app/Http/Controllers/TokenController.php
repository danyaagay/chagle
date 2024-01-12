<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Token;

class TokenController extends Controller
{
	public function index(Request $request)
	{
		$tokens =  Token::get();
		return response()->json($tokens);
	}

	public function store(Request $request)
	{
		$token = Token::create([
			'token' => $request->token,
			'status' => 1,
			'limit' => 200
		]);
		return response()->json($token);
	}

	public function update(Request $request, $id)
	{
	}

	public function destroy(Request $request, $id)
	{
		$token = Token::find($id);

		if (!$token) {
			return response()->json(['message' => 'Token not found'], 500);
		}

		$token->delete();
		return true;
	}

	public static function getToken()
	{
		//Внимание! Нужно перенести в фоновый процесс!
		//self::checkTokens();

		$token = Token::where('status', 1)
			->where('limit', '>', 0)
			->orderBy('updated_at', 'asc')
			->first();

		if ($token) {
			$token->decrement('limit');
		}

		return $token;
	}

	public static function setStatus($token, $status)
	{
		$token->status = $status;
		$token->save();
	}

	//public static function checkTokens()
	//{
	//    $tokens = Token::where('status', 2)->get();
	//    foreach ($tokens as $token) {
	//        $updatedAt = strtotime($token->updated_at);
	//        $currentTime = time();
	//        $tenMinutesAgo = strtotime('-10 minutes', $currentTime);
	//    
	//        if ($updatedAt < $tenMinutesAgo) {
	//            $token->status = 1;
	//            $token->save();
	//        }
	//    }
	//}
}
