<?php

namespace App\Services;

use App\Services\Tokenizer;
use App\Services\TransactionService;

class UserService
{
    public $tokenizer, $transactionService;

    public function __construct(Tokenizer $tokenizer, TransactionService $transactionService) {
        $this->tokenizer = $tokenizer;
        $this->transactionService = $transactionService;
    }

    public function checkLevel($chat, $user)
    {
        $isOpenRouter = in_array($chat->model, ['gpt-4', 'gpt-4-32k', 'gpt-4-turbo-preview']);

        if ($isOpenRouter && $user->level < 2) {
            return false;
        }

        return true;
    }

    public function balanceDown($history, $user, $answer, $model, $id)
    {
		// Считаем количество токенов
		if ($id) {
            $tokenCount = $this->tokenizer->openRouter($id);
            if (!$tokenCount) {
                $tokenCount = $this->tokenizer->openAi($history, $answer, $model);
            }
		} else {
            $tokenCount = $this->tokenizer->openAi($history, $answer, $model);
		}

		// Рассчитываем стоимость
		if ($model === 'gpt-3.5-turbo') {
			$pricePerTokens = 0.2;
		} elseif ($model === 'gpt-3.5-turbo-16k') {
			$pricePerTokens = 0.4;
		} elseif ($model === 'gpt-4') {
			$pricePerTokens = 6;
		} elseif ($model === 'gpt-4-32k') {
			$pricePerTokens = 12;
		} elseif ($model === 'gpt-4-turbo-preview') {
			$pricePerTokens = 3;
		}
		$pricePerToken = $pricePerTokens / 1000;
		$cost = $tokenCount * $pricePerToken;

		// Вычитаем стоимость из баланса
		$balance = $user->balance - $cost;

        $user->update(['balance' => $balance]);
        
        if (!isset($user->model)) {
            $this->transactionService->down($user, $cost);
        }

		return $balance;
    }
}
