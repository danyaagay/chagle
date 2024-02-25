<?php

namespace App\Models\Bot;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'telegram_id',
        'name',
        'shortname',
        'level',
        'balance',
        'model',
        'web',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    protected $connection = 'bot-mysql';
}
