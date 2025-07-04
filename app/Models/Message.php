<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'user_id',
        'conversation_id',
        'sender',
        'content',
    ];
    public function conversation() {
        return $this->belongsTo(Conversation::class);
    }
}
