<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'image', 'is_available', 'is_featured'];
    protected $casts = ['price' => 'decimal:2', 'is_available' => 'boolean', 'is_featured' => 'boolean'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
