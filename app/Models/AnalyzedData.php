<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnalyzedData extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'title',
        'summary',
        'full_report',
        'rating',
        'generated_by',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
