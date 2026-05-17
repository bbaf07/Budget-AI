<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreferencesController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'currency' => 'nullable|string|size:3',
            'locale'   => 'nullable|string|max:5',
        ]);

        $user = auth()->user();
        $data = array_filter($request->only(['currency', 'locale']));
        $user->update($data);

        return response()->json(['ok' => true, 'user' => $user]);
    }
}