<?php

namespace App\Services;

use App\Services\Tokenizer;
use App\Services\TransactionService;
use App\Services\StreamService;

class UserService
{
    public function __construct(private Tokenizer $tokenizer, private TransactionService $transactionService, private StreamService $streamService) {
    }

    public function checkLevel($user, $chat = false)
    {
        $oneLevel = [
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k',
            'anthropic/claude-instant-1',
            'anthropic/claude-3-haiku',
            'google/gemini-pro'
        ];

        if ($user->level < 2 && !in_array((is_object($chat)) ? $chat->model : $user->model, $oneLevel)) {
            return false;
        }

        return true;
    }

    public function balanceDown($history, $user, $answer, $model, $id)
    {
        $isOpenRouter = $this->streamService->isOpenRouter($model);

		// Считаем количество токенов
		if ($isOpenRouter) {
            $tokenCount = $this->tokenizer->openRouter($id);
            //if (!$tokenCount) {
            //    $tokenCount = $this->tokenizer->openAi($history, $answer, $model);
            //}
		} else {
            $tokenCount = $this->tokenizer->openAi($history, $answer, $model);
		}

		// Рассчитываем стоимость
		if ($model === 'gpt-3.5-turbo') {
			$pricePerTokens = 0.2;
		} elseif ($model === 'gpt-3.5-turbo-16k') {
			$pricePerTokens = 0.4;
		} elseif ($model === 'openai/gpt-4') {
			$pricePerTokens = 6;
		} elseif ($model === 'openai/gpt-4-32k') {
			$pricePerTokens = 12;
		} elseif ($model === 'openai/gpt-4-turbo-preview') {
			$pricePerTokens = 3;
		} elseif ($model === 'anthropic/claude-instant-1') {
			$pricePerTokens = 0.48;
		} elseif ($model === 'anthropic/claude-3-opus') {
            $pricePerTokens = 12;
        } elseif ($model === 'anthropic/claude-3-haiku') {
            $pricePerTokens = 0.225;
        } elseif ($model === 'google/gemini-pro') {
            $pricePerTokens = 0.159;
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
