<?php
namespace App\Services;

use Yethee\Tiktoken\EncoderProvider;

class Tokenizer
{
    public function openRouter($id)
    {
        $curl = curl_init('https://openrouter.ai/api/v1/generation?id=' . $id);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'Authorization: Bearer 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'
        ));
        $response = curl_exec($curl);
        $data = json_decode($response, true);

        return [
            'prompt' => $data['data']['tokens_prompt'],
            'completion' => $data['data']['tokens_completion']
        ];
    }

    public function openAi($history, $answer, $model)
    {
        $provider = new EncoderProvider();
        $encoder = $provider->getForModel($model);

        $tokensPrompt = 0;

        foreach ($history as $history) {
            $tokens = $encoder->encode($history['content']);
            $tokensPrompt += count($tokens);
        }

        $tokensCompletion = count($encoder->encode($answer));

        return [
            'prompt' => $tokensPrompt,
            'completion' => $tokensCompletion
        ];
    }
}

?>