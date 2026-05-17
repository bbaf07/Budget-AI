<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoalController extends Controller
{
    public function index()
    {
        $goals = Goal::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'name' => $g->name,
                'target_amount' => $g->target_amount,
                'current_amount' => $g->current_amount,
                'deadline' => $g->deadline?->format('Y-m-d'),
                'icon' => $g->icon,
                'percent' => $g->target_amount > 0 ? round(($g->current_amount / $g->target_amount) * 100) : 0,
            ]);

        return Inertia::render('Goals', ['goals' => $goals]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'deadline' => 'nullable|date',
            'icon' => 'nullable|string|max:4',
        ]);

        Goal::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'target_amount' => $request->target_amount,
            'current_amount' => 0,
            'deadline' => $request->deadline,
            'icon' => $request->icon ?: '🎯',
        ]);

        return redirect()->back();
    }

    public function deposit(Request $request, Goal $goal)
    {
        if ($goal->user_id !== auth()->id()) abort(403);
        $request->validate(['amount' => 'required|numeric|min:0.01']);

        $goal->update(['current_amount' => $goal->current_amount + $request->amount]);
        return redirect()->back();
    }

    public function withdraw(Request $request, Goal $goal)
    {
        if ($goal->user_id !== auth()->id()) abort(403);
        $request->validate(['amount' => 'required|numeric|min:0.01']);

        $newAmount = max(0, $goal->current_amount - $request->amount);
        $goal->update(['current_amount' => $newAmount]);
        return redirect()->back();
    }

    public function destroy(Goal $goal)
    {
        if ($goal->user_id !== auth()->id()) abort(403);
        $goal->delete();
        return redirect()->back();
    }
}