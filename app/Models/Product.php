<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'price',
        'keywords',
        'url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'product_categories');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function amazonReviews()
    {
        return $this->hasMany(AmazonReview::class);
    }

    public function amazonImages()
    {
        return $this->hasMany(AmazonImages::class);
    }
    public function analyzedReports()
    {
        return $this->hasMany(AnalyzedData::class);
    }
}
