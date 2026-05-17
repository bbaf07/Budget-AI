<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use App\Models\MoneyRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MoneyController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $demandesRecues = MoneyRequest::with('fromUser:id,name,email')
            ->where('to_user_id', $userId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $demandesEnvoyees = MoneyRequest::with('toUser:id,name,email')
            ->where('from_user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return Inertia::render('Money', [
            'demandesRecues'   => $demandesRecues,
            'demandesEnvoyees' => $demandesEnvoyees,
        ]);
    }

    public function sendToUser(Request $request)
    {
        $request->validate([
            'email'  => 'required|email|exists:users,email',
            'amount' => 'required|numeric|min:0.01',
            'label'  => 'nullable|string|max:255',
        ]);

        $sender   = auth()->user();
        $receiver = User::where('email', $request->email)->first();

        if ($receiver->id === $sender->id) {
            return redirect()->back()->withErrors(['email' => 'Vous ne pouvez pas vous envoyer de l\'argent à vous-même.']);
        }

        $label = $request->label ?: "Transfert à {$receiver->name}";

        // Crée 2 transactions
        Transaction::create([
            'user_id'  => $sender->id,
            'label'    => $label,
            'amount'   => $request->amount,
            'type'     => 'expense',
            'category' => 'Transfert',
            'date'     => now()->toDateString(),
        ]);

        Transaction::create([
            'user_id'  => $receiver->id,
            'label'    => "Reçu de {$sender->name}",
            'amount'   => $request->amount,
            'type'     => 'income',
            'category' => 'Transfert',
            'date'     => now()->toDateString(),
        ]);

        // Notification au destinataire
        Notification::create([
            'user_id' => $receiver->id,
            'type'    => 'money_received',
            'title'   => 'Argent reçu !',
            'message' => "{$sender->name} vous a envoyé {$request->amount} €",
            'data'    => ['amount' => $request->amount, 'from' => $sender->name],
        ]);

        return redirect()->back()->with('success', "{$request->amount} € envoyés à {$receiver->name} !");
    }

    public function sendToIban(Request $request)
    {
        $request->validate([
            'iban'   => 'required|string|min:14',
            'amount' => 'required|numeric|min:0.01',
            'label'  => 'nullable|string|max:255',
        ]);

        $label = $request->label ?: "Virement IBAN " . substr($request->iban, -4);

        Transaction::create([
            'user_id'  => auth()->id(),
            'label'    => $label,
            'amount'   => $request->amount,
            'type'     => 'expense',
            'category' => 'Transfert',
            'date'     => now()->toDateString(),
        ]);

        return redirect()->back()->with('success', "{$request->amount} € envoyés vers l'IBAN.");
    }

    public function requestMoney(Request $request)
    {
        $request->validate([
            'email'   => 'required|email|exists:users,email',
            'amount'  => 'required|numeric|min:0.01',
            'message' => 'nullable|string|max:255',
        ]);

        $sender   = auth()->user();
        $receiver = User::where('email', $request->email)->first();

        if ($receiver->id === $sender->id) {
            return redirect()->back()->withErrors(['email' => 'Vous ne pouvez pas vous demander de l\'argent à vous-même.']);
        }

        MoneyRequest::create([
            'from_user_id' => $sender->id,
            'to_user_id'   => $receiver->id,
            'amount'       => $request->amount,
            'message'      => $request->message,
            'status'       => 'pending',
        ]);

        Notification::create([
            'user_id' => $receiver->id,
            'type'    => 'money_request',
            'title'   => 'Nouvelle demande d\'argent',
            'message' => "{$sender->name} vous demande {$request->amount} €",
            'data'    => ['amount' => $request->amount, 'from' => $sender->name],
        ]);

        return redirect()->back()->with('success', "Demande envoyée à {$receiver->name}.");
    }

    public function acceptRequest(MoneyRequest $moneyRequest)
    {
        if ($moneyRequest->to_user_id !== auth()->id()) abort(403);
        if ($moneyRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'Cette demande a déjà été traitée.');
        }

        $payer    = auth()->user();
        $receiver = $moneyRequest->fromUser;
        $amount   = $moneyRequest->amount;

        Transaction::create([
            'user_id'  => $payer->id,
            'label'    => "Demande de {$receiver->name}",
            'amount'   => $amount,
            'type'     => 'expense',
            'category' => 'Transfert',
            'date'     => now()->toDateString(),
        ]);

        Transaction::create([
            'user_id'  => $receiver->id,
            'label'    => "Reçu de {$payer->name}",
            'amount'   => $amount,
            'type'     => 'income',
            'category' => 'Transfert',
            'date'     => now()->toDateString(),
        ]);

        $moneyRequest->update(['status' => 'accepted']);

        Notification::create([
            'user_id' => $receiver->id,
            'type'    => 'request_accepted',
            'title'   => 'Demande acceptée',
            'message' => "{$payer->name} a accepté votre demande de {$amount} €",
            'data'    => ['amount' => $amount, 'from' => $payer->name],
        ]);

        return redirect()->back()->with('success', 'Demande acceptée et paiement effectué.');
    }

    public function declineRequest(MoneyRequest $moneyRequest)
    {
        if ($moneyRequest->to_user_id !== auth()->id()) abort(403);

        $moneyRequest->update(['status' => 'declined']);

        Notification::create([
            'user_id' => $moneyRequest->from_user_id,
            'type'    => 'request_declined',
            'title'   => 'Demande refusée',
            'message' => auth()->user()->name . " a refusé votre demande de {$moneyRequest->amount} €",
            'data'    => ['amount' => $moneyRequest->amount],
        ]);

        return redirect()->back()->with('success', 'Demande refusée.');
    }
}