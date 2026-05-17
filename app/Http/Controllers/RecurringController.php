<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use Illuminate\Http\Request;

class RecurringController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'frequency' => 'required|in:daily,weekly,monthly,yearly',
            'next_date' => 'required|date',
        ]);

        RecurringTransaction::create([
            'user_id' => auth()->id(),
            'label' => $request->label,
            'amount' => $request->amount,
            'type' => $request->type,
            'category' => $request->category,
            'frequency' => $request->frequency,
            'next_date' => $request->next_date,
            'active' => true,
        ]);

        return redirect()->back();
    }

    public function toggle(RecurringTransaction $recurring)
    {
        if ($recurring->user_id !== auth()->id()) abort(403);
        $recurring->update(['active' => !$recurring->active]);
        return redirect()->back();
    }

    public function destroy(RecurringTransaction $recurring)
    {
        if ($recurring->user_id !== auth()->id()) abort(403);
        $recurring->delete();
        return redirect()->back();
    }
}