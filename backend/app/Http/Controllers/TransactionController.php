<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $transactions = $user->transactions()
        ->orderBy('updated_at', 'desc')
        ->skip($request->offset)
        ->take(20)
        ->get()
        ->toArray();

		if ($user->transactions()->orderBy('updated_at', 'desc')->count() > $request->offset + 20) {
			$hasMore = true;
		} else {
			$hasMore = false;
		}

		return response()->json([
			'transactions' => $transactions,
			'hasMore' => $hasMore
		]);
    }

    public function store()
    {
    }

    public function update(Request $request, $id)
    {
    }

    public function destroy(Request $request, $id)
    {
    }
}
