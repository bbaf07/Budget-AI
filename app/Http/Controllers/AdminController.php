<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Budget;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::withCount('transactions')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id'                => $u->id,
                'name'              => $u->name,
                'email'             => $u->email,
                'role'              => $u->role,
                'transactions_count'=> $u->transactions_count,
                'created_at'        => $u->created_at->format('d/m/Y'),
            ]);

        $stats = [
            'total_users'        => User::count(),
            'total_transactions' => Transaction::count(),
            'total_revenus'      => Transaction::where('type', 'income')->sum('amount'),
            'total_depenses'     => Transaction::where('type', 'expense')->sum('amount'),
            'nouveaux_ce_mois'   => User::whereMonth('created_at', now()->month)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    public function toggleRole(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas modifier votre propre rôle.');
        }

        $user->update([
            'role' => $user->role === 'admin' ? 'user' : 'admin'
        ]);

        return redirect()->back()->with('success', 'Rôle mis à jour.');
    }

    public function destroyUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas vous supprimer.');
        }
        $user->delete();
        return redirect()->back()->with('success', 'Utilisateur supprimé.');
    }
}