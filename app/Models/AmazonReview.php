<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmazonReview extends Model
{
    protected $fillable = [
        'product_id',
        'rating',
        'reviewer_name',
        'comment',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
