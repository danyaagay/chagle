<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->greeting('Добро пожаловать')
                ->subject('Подтвердите адрес электронной почты')
                ->line('Нажмите кнопку ниже, чтобы подтвердить свой адрес электронной почты.')
                ->action('Подтвердить', $url)
                ->line('Если Вы не создавали аккаунт, никаких дальнейших действий не требуется.');
        });
    }
}
