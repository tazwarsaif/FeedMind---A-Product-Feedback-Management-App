<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmazonImages extends Model
{
    protected $fillable = [
        'product_id',
        'image_url',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
