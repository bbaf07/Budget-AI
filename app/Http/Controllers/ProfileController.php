<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        return Inertia::render('Profile', [
            'user' => auth()->user(),
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($request->only(['name', 'email']));
        return redirect()->back()->with('success', 'Profil mis à jour.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, auth()->user()->password)) {
            return redirect()->back()->withErrors(['current_password' => 'Mot de passe actuel incorrect.']);
        }

        auth()->user()->update(['password' => Hash::make($request->password)]);
        return redirect()->back()->with('success', 'Mot de passe modifié.');
    }

    public function destroy(Request $request)
    {
        $request->validate(['password' => 'required']);

        if (!Hash::check($request->password, auth()->user()->password)) {
            return redirect()->back()->withErrors(['password' => 'Mot de passe incorrect.']);
        }

        $user = auth()->user();
        auth()->logout();
        $user->delete();

        return redirect('/');
    }
}