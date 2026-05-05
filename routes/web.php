<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\TransactionController;

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [TransactionController::class, 'index'])->name('dashboard');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    Route::get('/transactions', function () {
    $transactions = \App\Models\Transaction::where('user_id', auth()->id())
        ->orderBy('date', 'desc')
        ->get();
    return \Inertia\Inertia::render('Transactions', [
        'transactions' => $transactions,
    ]);
})->name('transactions.index');

Route::get('/chatbot', function () {
    return Inertia::render('Chatbot');
})->name('chatbot.index');

Route::post('/chatbot/message', function (\Illuminate\Http\Request $request) {
    // Réponse temporaire — le Membre 3 branchera Gemini ici
    return response()->json([
        'reply' => "Je suis en cours de configuration. Le Membre 3 va bientôt me connecter à Gemini ! 🔧"
    ]);
})->name('chatbot.message');

Route::post('/transactions/import', [TransactionController::class, 'importCsv'])->name('transactions.import');

});

use App\Http\Controllers\BudgetController;

Route::get('/budget', [BudgetController::class, 'index'])->name('budget.index');
Route::post('/budget', [BudgetController::class, 'store'])->name('budget.store');
Route::delete('/budget/{budget}', [BudgetController::class, 'destroy'])->name('budget.destroy');
require __DIR__.'/auth.php';
