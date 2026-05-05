<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index()
    {
        $budgets = Budget::where('user_id', auth()->id())->get();

        // Pour chaque budget, calcule le total dépensé ce mois
        $mois = now()->month;
        $annee = now()->year;

        $budgetsAvecDepenses = $budgets->map(function ($budget) use ($mois, $annee) {
            $depense = Transaction::where('user_id', auth()->id())
                ->where('type', 'expense')
                ->where('category', $budget->category)
                ->whereMonth('date', $mois)
                ->whereYear('date', $annee)
                ->sum('amount');

            return [
                'id'           => $budget->id,
                'category'     => $budget->category,
                'limit_amount' => $budget->limit_amount,
                'spent'        => $depense,
                'percent'      => $budget->limit_amount > 0
                    ? round(($depense / $budget->limit_amount) * 100)
                    : 0,
            ];
        });

        return Inertia::render('Budget', [
            'budgets' => $budgetsAvecDepenses,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category'     => 'required|string',
            'limit_amount' => 'required|numeric|min:1',
        ]);

        // Met à jour si existe déjà, sinon crée
        Budget::updateOrCreate(
            ['user_id' => auth()->id(), 'category' => $request->category],
            ['limit_amount' => $request->limit_amount]
        );

        return redirect()->back()->with('success', 'Budget enregistré !');
    }

    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== auth()->id()) abort(403);
        $budget->delete();
        return redirect()->back()->with('success', 'Budget supprimé.');
    }
}