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

        $tokenCount = $data['data']['tokens_prompt'] + $data['data']['tokens_completion'];

        return $tokenCount;
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

        $tokenCount = $tokensPrompt + $tokensCompletion;

        return $tokenCount;
    }

    public function our($history, $answer)
    {
        $text = '';
        foreach ($history as $history) {
            $text .= $history['content'];
        }
        $text .= $answer;
        $text = str_replace(" ", "", $text);

        $tokenCount = ceil(mb_strlen($text) / 2); // Каждые 2 символа (это не правильно)

        return $tokenCount;
    }
}

?>