<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proxy;

class ProxyController extends Controller
{
    public function index(Request $request)
    {
        $proxy = Proxy::all();

        return response()->json($proxy);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'schema' => 'required|string',
            'ip' => 'required|string|unique:proxies',
            'auth' => 'nullable|string',
            'status' => 'required|integer',
            'checked_at' => 'nullable|date',
        ]);

        $proxy = Proxy::create($validatedData);

        return response()->json($proxy, 201);
    }

    public static function getProxy()
	{
		$proxy = Proxy::where('status', 1)
			//->where('limit', '>', 0)
			->orderBy('checked_at', 'asc')
			->first();

		if ($proxy) {
			$proxy->update(['checked_at' => now()]);
		}

		return $proxy;
	}

	public static function setStatus($proxy, $status)
	{
		$proxy->status = $status;
		$proxy->save();
	}

    /**
     * Display the specified resource.
     */
    public function test()
    {
        return self::getProxy();
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
		$proxy = Proxy::find($id);

		if (!$proxy) {
			return response()->json(['message' => 'Token not found'], 500);
		}

		$proxy->delete();
		return true;
    }
}
