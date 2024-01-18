<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Token;
use App\Models\Message;
use App\Models\Proxy;

class SummaryController extends Controller
{
	public function index(Request $request, $type)
	{
		if ($type === 'all') {
			$userCount = User::count();
			$tokenCount = Token::count();
			$messageCount = Message::count();

			return response()->json([
				['title' => 'Клиенты', 'value' => $userCount],
				['title' => 'Сообщения', 'value' => $messageCount],
				['title' => 'Токены', 'value' => $tokenCount],
			]);
		} elseif ($type === 'users') {
			$userCount = User::count();
			$messageCount = Message::count();

			return response()->json([
				['title' => 'Клиенты', 'value' => $userCount],
				['title' => 'Сообщения', 'value' => $messageCount],
			]);
		} elseif ($type === 'tokens') {
			$tokenCount = Token::count();

			return response()->json([
				['title' => 'Токены', 'value' => $tokenCount],
			]);
		} elseif ($type === 'proxy') {
			$all = Proxy::count();
			$alive = Proxy::where('status', '=', 1)->count();

			return response()->json([
				[
					'title' => 'Всего',
					'value' => $all,
				],
				[
					'title' => 'Рабочих',
					'value' => $alive,
				],
				[
					'title' => 'Не рабочих',
					'value' => $all - $alive,
				]
			]);
		}
	}
}
