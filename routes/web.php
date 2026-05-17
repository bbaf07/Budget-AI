<?php

use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\MoneyController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\RecurringController;
use App\Http\Controllers\ProfileController;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\RecurringTransaction;
use App\Models\Notification;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::middleware('auth')->group(function () {

// Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\AdminController::class, 'index'])->name('admin.dashboard');
        Route::post('/users/{user}/toggle-role', [\App\Http\Controllers\AdminController::class, 'toggleRole']);
        Route::delete('/users/{user}', [\App\Http\Controllers\AdminController::class, 'destroyUser']);
    });

    // Dashboard
    Route::get('/dashboard', [TransactionController::class, 'index'])->name('dashboard');

    // Transactions
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);
    Route::post('/transactions/import', [TransactionController::class, 'importCsv']);
    Route::get('/transactions', function () {
        $userId = auth()->id();
        $transactions = Transaction::where('user_id', $userId)->orderBy('date', 'desc')->get();
        $recurring = RecurringTransaction::where('user_id', $userId)->orderBy('next_date')->get();
        return Inertia::render('Transactions', [
            'transactions' => $transactions,
            'recurring' => $recurring,
        ]);
    })->name('transactions.index');

    // Recurring
    Route::post('/recurring', [RecurringController::class, 'store']);
    Route::post('/recurring/{recurring}/toggle', [RecurringController::class, 'toggle']);
    Route::delete('/recurring/{recurring}', [RecurringController::class, 'destroy']);

    // Budgets
    Route::get('/budget', [BudgetController::class, 'index'])->name('budget.index');
    Route::post('/budget', [BudgetController::class, 'store']);
    Route::delete('/budget/{budget}', [BudgetController::class, 'destroy']);

    // Goals
    Route::get('/goals', [GoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [GoalController::class, 'store']);
    Route::post('/goals/{goal}/deposit', [GoalController::class, 'deposit']);
    Route::post('/goals/{goal}/withdraw', [GoalController::class, 'withdraw']);
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // Money
    Route::get('/money', [MoneyController::class, 'index'])->name('money.index');
    Route::post('/money/send-user', [MoneyController::class, 'sendToUser']);
    Route::post('/money/send-iban', [MoneyController::class, 'sendToIban']);
    Route::post('/money/request', [MoneyController::class, 'requestMoney']);
    Route::post('/money/accept/{moneyRequest}', [MoneyController::class, 'acceptRequest']);
    Route::post('/money/decline/{moneyRequest}', [MoneyController::class, 'declineRequest']);

    // Notifications
    Route::get('/notifications', function () {
        $notifications = Notification::where('user_id', auth()->id())->orderBy('created_at', 'desc')->limit(50)->get();
        return response()->json(['notifications' => $notifications]);
    });
    Route::post('/notifications/read-all', function () {
        Notification::where('user_id', auth()->id())->update(['read' => true]);
        return response()->json(['ok' => true]);
    });

    // Preferences
    Route::post('/preferences', [\App\Http\Controllers\PreferencesController::class, 'update']);

    // Weather
    Route::get('/weather', function (Request $request) {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        if (!$lat || !$lon) return response()->json(['error' => 'Missing coords'], 400);

        try {
            $weatherResponse = Http::timeout(10)->get("https://api.open-meteo.com/v1/forecast", [
                'latitude' => $lat, 'longitude' => $lon,
                'current' => 'temperature_2m,weather_code,wind_speed_10m',
                'timezone' => 'auto',
            ]);
            $geoResponse = Http::timeout(10)->get("https://nominatim.openstreetmap.org/reverse", [
                'lat' => $lat, 'lon' => $lon, 'format' => 'json',
            ]);
            $weather = $weatherResponse->json('current');
            $address = $geoResponse->json('address') ?? [];
            $city = $address['city'] ?? $address['town'] ?? $address['village'] ?? $address['municipality'] ?? 'Inconnu';
            return response()->json([
                'temperature' => $weather['temperature_2m'] ?? null,
                'weather_code' => $weather['weather_code'] ?? null,
                'wind_speed' => $weather['wind_speed_10m'] ?? null,
                'city' => $city,
                'country' => $address['country'] ?? '',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Chatbot
    Route::get('/chatbot', function () {
        return Inertia::render('Chatbot');
    })->name('chatbot.index');

    Route::post('/chatbot/message', function (Request $request) {
        $userId = auth()->id();
        $message = $request->input('message', '');
        $locale = $request->input('locale', 'fr');

        $transactions = Transaction::where('user_id', $userId)->orderBy('date', 'desc')->limit(20)
            ->get(['date', 'label', 'amount', 'type', 'category']);
        $budgets = Budget::where('user_id', $userId)->get(['category', 'limit_amount']);

        $revenus = Transaction::where('user_id', $userId)->where('type', 'income')->whereMonth('date', now()->month)->sum('amount');
        $depenses = Transaction::where('user_id', $userId)->where('type', 'expense')->whereMonth('date', now()->month)->sum('amount');

        $contextTx = $transactions->map(fn($t) => "- {$t->date->format('Y-m-d')} | {$t->type} | {$t->category} | {$t->amount}€ | {$t->label}")->implode("\n");
        $contextBud = $budgets->map(fn($b) => "- {$b->category} : {$b->limit_amount}€/mois")->implode("\n");

        $languages = ['fr' => 'français', 'en' => 'English', 'es' => 'español', 'de' => 'Deutsch', 'it' => 'italiano', 'pt' => 'português', 'ar' => 'العربية', 'zh' => '中文', 'hi' => 'हिन्दी', 'ru' => 'русский'];
        $lang = $languages[$locale] ?? 'français';

        $prompt = "You are a warm personal budget assistant. Reply in {$lang}, concise (3-5 sentences max).

Monthly data: Income {$revenus}€, Expenses {$depenses}€, Balance " . ($revenus - $depenses) . "€

Budgets:
{$contextBud}

Recent transactions:
{$contextTx}

User question: {$message}";

        $apiKey = env('GEMINI_API_KEY');
        try {
            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={$apiKey}",
                [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['temperature' => 0.7, 'maxOutputTokens' => 500],
                ]
            );
            $reply = $response->json('candidates.0.content.parts.0.text');
            return response()->json(['reply' => $reply ?? 'Erreur API.']);
        } catch (\Exception $e) {
            return response()->json(['reply' => 'Erreur : ' . $e->getMessage()]);
        }
    });

});

require __DIR__.'/auth.php';