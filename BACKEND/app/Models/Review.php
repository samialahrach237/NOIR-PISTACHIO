<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'customer_name', 'rating', 'comment', 'is_approved'];
    protected $casts = ['is_approved' => 'boolean'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
