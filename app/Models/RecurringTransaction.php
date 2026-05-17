<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecurringTransaction extends Model
{
    protected $fillable = ['user_id', 'label', 'amount', 'type', 'category', 'frequency', 'next_date', 'active'];

    protected $casts = [
        'next_date' => 'date',
        'active' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
}