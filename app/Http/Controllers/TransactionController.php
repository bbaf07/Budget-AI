<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $transactions = Transaction::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->get();

        $revenus = $transactions->where('type', 'income')->sum('amount');
        $depenses = $transactions->where('type', 'expense')->sum('amount');
        $solde = $revenus - $depenses;

        $mois = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->translatedFormat('M Y');
            $rev = Transaction::where('user_id', $userId)->where('type', 'income')
                ->whereMonth('date', $date->month)->whereYear('date', $date->year)->sum('amount');
            $dep = Transaction::where('user_id', $userId)->where('type', 'expense')
                ->whereMonth('date', $date->month)->whereYear('date', $date->year)->sum('amount');
            $mois[] = [
                'mois' => $label,
                'revenus' => round($rev, 2),
                'depenses' => round($dep, 2),
            ];
        }

        $parCategorie = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->get()
            ->groupBy('category')
            ->map(fn($g) => round($g->sum('amount'), 2))
            ->map(fn($total, $cat) => ['name' => $cat, 'value' => $total])
            ->values();

        // Prévision simple : moyenne des 3 derniers mois
        $previsionRevenus = round(collect($mois)->slice(-3)->avg('revenus'), 2);
        $previsionDepenses = round(collect($mois)->slice(-3)->avg('depenses'), 2);

        return Inertia::render('Dashboard', [
            'transactions' => $transactions,
            'revenus' => $revenus,
            'depenses' => $depenses,
            'solde' => $solde,
            'parMois' => $mois,
            'parCategorie' => $parCategorie,
            'prevision' => [
                'revenus' => $previsionRevenus,
                'depenses' => $previsionDepenses,
                'solde' => $previsionRevenus - $previsionDepenses,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'date' => 'required|date',
        ]);

        Transaction::create([
            'user_id' => auth()->id(),
            'label' => $request->label,
            'amount' => $request->amount,
            'type' => $request->type,
            'category' => $request->category,
            'date' => $request->date,
        ]);

        return redirect()->back();
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) abort(403);
        $transaction->delete();
        return redirect()->back();
    }

    public function importCsv(Request $request)
    {
        $request->validate(['csv_file' => 'required|file|mimes:csv,txt|max:2048']);

        $file = $request->file('csv_file');
        $lines = array_map('str_getcsv', file($file->getPathname()));
        $header = array_map('strtolower', array_map('trim', $lines[0]));
        $isHeader = in_array('label', $header) || in_array('libelle', $header) || in_array('montant', $header);
        $rows = $isHeader ? array_slice($lines, 1) : $lines;

        foreach ($rows as $row) {
            if (count(array_filter($row)) === 0 || count($row) < 4) continue;

            $type = strtolower(trim($row[3]));
            if (in_array($type, ['revenu'])) $type = 'income';
            if (in_array($type, ['depense', 'dépense'])) $type = 'expense';
            if (!in_array($type, ['income', 'expense'])) continue;

            try {
                $dateObj = \Carbon\Carbon::parse(trim($row[0]));
            } catch (\Exception $e) { continue; }

            Transaction::create([
                'user_id' => auth()->id(),
                'date' => $dateObj->toDateString(),
                'label' => trim($row[1]),
                'amount' => abs(floatval(str_replace(',', '.', trim($row[2])))),
                'type' => $type,
                'category' => isset($row[4]) ? trim($row[4]) : 'Autre',
            ]);
        }

        return redirect()->back();
    }
}