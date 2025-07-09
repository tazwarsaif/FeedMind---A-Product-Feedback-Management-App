<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiCachedSummary extends Model
{
    protected $fillable = [
        'user_id',
        'conversation_id',
        'summary',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
