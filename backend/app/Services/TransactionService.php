<?php

namespace App\Services;

class TransactionService
{
    public function down($user, $newBalance) {
        $user->transactions()->create([
            'type' => 'Списание',
            'amount' => $user->balance - $newBalance,
        ]);
    }
}
