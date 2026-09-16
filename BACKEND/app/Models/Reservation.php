<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'email', 'phone', 'reservation_date', 'reservation_time', 'guests', 'status', 'notes'];
    protected $casts = ['reservation_date' => 'date'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
