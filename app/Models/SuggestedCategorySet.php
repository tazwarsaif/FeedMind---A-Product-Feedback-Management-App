<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuggestedCategorySet extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'categories'];
    protected $casts = [
        'categories' => 'array', // Automatically cast JSON to array
    ];
}
