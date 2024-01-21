<?php

namespace App\Models\Bot;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'role',
        'content',
        'error_code'
    ];

    protected $connection = 'bot-mysql';
}