<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::where('user_id', auth()->id())
            ->orderBy('date', 'desc')
            ->get();

        $revenus  = $transactions->where('type', 'income')->sum('amount');
        $depenses = $transactions->where('type', 'expense')->sum('amount');
        $solde    = $revenus - $depenses;

        // Données des 6 derniers mois pour les graphiques
        $mois = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $label = $date->translatedFormat('M Y');

            $rev = Transaction::where('user_id', auth()->id())
                ->where('type', 'income')
                ->whereMonth('date', $date->month)
                ->whereYear('date', $date->year)
                ->sum('amount');

            $dep = Transaction::where('user_id', auth()->id())
                ->where('type', 'expense')
                ->whereMonth('date', $date->month)
                ->whereYear('date', $date->year)
                ->sum('amount');

            $mois[] = [
                'mois'     => $label,
                'revenus'  => round($rev, 2),
                'depenses' => round($dep, 2),
            ];
        }

        // Dépenses par catégorie ce mois
        $parCategorie = Transaction::where('user_id', auth()->id())
            ->where('type', 'expense')
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->get()
            ->groupBy('category')
            ->map(fn($g) => round($g->sum('amount'), 2))
            ->map(fn($total, $cat) => ['name' => $cat, 'value' => $total])
            ->values();

        return Inertia::render('Dashboard', [
            'transactions' => $transactions,
            'revenus'      => $revenus,
            'depenses'     => $depenses,
            'solde'        => $solde,
            'parMois'      => $mois,
            'parCategorie' => $parCategorie,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'label'    => 'required|string|max:255',
            'amount'   => 'required|numeric|min:0.01',
            'type'     => 'required|in:income,expense',
            'category' => 'required|string',
            'date'     => 'required|date',
        ]);

        Transaction::create([
            'user_id'  => auth()->id(),
            'label'    => $request->label,
            'amount'   => $request->amount,
            'type'     => $request->type,
            'category' => $request->category,
            'date'     => $request->date,
        ]);

        return redirect()->back()->with('success', 'Transaction ajoutée !');
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            abort(403);
        }
        $transaction->delete();
        return redirect()->back()->with('success', 'Transaction supprimée.');
    }

    public function importCsv(Request $request)
{
    $request->validate([
        'csv_file' => 'required|file|mimes:csv,txt|max:2048',
    ]);

    $file  = $request->file('csv_file');
    $lines = array_map('str_getcsv', file($file->getPathname()));

    // Ignore la première ligne si c'est un en-tête
    $header = array_map('strtolower', array_map('trim', $lines[0]));
    $isHeader = in_array('label', $header) || in_array('libelle', $header) || in_array('montant', $header);
    $rows = $isHeader ? array_slice($lines, 1) : $lines;

    $imported = 0;
    $errors   = [];

    foreach ($rows as $i => $row) {
        // Ignore les lignes vides
        if (count(array_filter($row)) === 0) continue;

        // Format attendu : date, label, montant, type, categorie
        if (count($row) < 4) {
            $errors[] = "Ligne " . ($i + 2) . " ignorée : pas assez de colonnes.";
            continue;
        }

        $date     = trim($row[0]);
        $label    = trim($row[1]);
        $amount   = floatval(str_replace(',', '.', trim($row[2])));
        $type     = strtolower(trim($row[3]));
        $category = isset($row[4]) ? trim($row[4]) : 'Autre';

        // Valide le type
        if (!in_array($type, ['income', 'expense', 'revenu', 'depense', 'dépense'])) {
            $errors[] = "Ligne " . ($i + 2) . " ignorée : type invalide ($type).";
            continue;
        }

        // Normalise le type en français
        if (in_array($type, ['revenu'])) $type = 'income';
        if (in_array($type, ['depense', 'dépense'])) $type = 'expense';

        // Valide la date
        try {
            $dateObj = \Carbon\Carbon::parse($date);
        } catch (\Exception $e) {
            $errors[] = "Ligne " . ($i + 2) . " ignorée : date invalide ($date).";
            continue;
        }

        Transaction::create([
            'user_id'  => auth()->id(),
            'label'    => $label,
            'amount'   => abs($amount),
            'type'     => $type,
            'category' => $category,
            'date'     => $dateObj->toDateString(),
        ]);

        $imported++;
    }

    return redirect()->back()->with([
        'success' => "$imported transaction(s) importée(s) avec succès.",
        'import_errors' => $errors,
    ]);
}
}