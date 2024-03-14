<?php

namespace App\Services;

class TransactionService
{
    public function down($user, $cost) {
        $user->transactions()->create([
            'type' => 'Списание',
            'amount' => $cost,
        ]);
    }
}
