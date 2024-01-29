<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'model',
        'system_message',
        'max_tokens',
        'history'
    ];

    // Продублировано в базе данных и в фронтенде
    protected $attributes = [
        'model' => 'gpt-3.5-turbo',
        'system_message' => '',
        'max_tokens' => 2048,
        'history' => 1
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
