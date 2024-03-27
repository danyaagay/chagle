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
            $tokens = $this->tokenizer->openRouter($id);
		} else {
            $tokens = $this->tokenizer->openAi($history, $answer, $model);
		}

		// Рассчитываем стоимость
		if ($model === 'gpt-3.5-turbo') {
			$pricePrompt = 0.2;
            $priceCompletion = 0.3;
		} elseif ($model === 'gpt-3.5-turbo-16k') {
			$pricePrompt = 0.4;
            $priceCompletion = 0.6;
		} elseif ($model === 'openai/gpt-4') {
            $pricePrompt = 4.5;
            $priceCompletion = 9;
		} elseif ($model === 'openai/gpt-4-32k') {
            $pricePrompt = 9;
            $priceCompletion = 18;
		} elseif ($model === 'openai/gpt-4-turbo-preview') {
            $pricePrompt = 2.5;
            $priceCompletion = 4.5;
		} elseif ($model === 'anthropic/claude-instant-1') {
            $pricePrompt = 0.36;
            $priceCompletion = 0.48;
		} elseif ($model === 'anthropic/claude-3-opus') {
            $pricePrompt = 2;
            $priceCompletion = 10;
        } elseif ($model === 'anthropic/claude-3-haiku') {
            $pricePrompt = 0.04;
            $priceCompletion = 0.2;
        } elseif ($model === 'google/gemini-pro') {
            $pricePrompt = 0.04;
            $priceCompletion = 0.11;
        }


		$pricePerTokenPrompt = $pricePrompt / 1000;
        $pricePerTokenCompletion = $priceCompletion / 1000;

		$cost = ($tokens['prompt'] * $pricePerTokenPrompt) + ($tokens['completion'] * $pricePerTokenCompletion);

		// Вычитаем стоимость из баланса
		$balance = $user->balance - $cost;

        $user->update(['balance' => $balance]);
        
        if (!isset($user->model)) {
            $this->transactionService->down($user, $cost);
        }

		return $balance;
    }
}
