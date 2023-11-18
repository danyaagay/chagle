<?php

namespace App\Http\Controllers;

use OpenAI;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use App\Http\Controllers\TokenController;

class StreamsController extends Controller
{
    /**
     * The stream source.
     *
     * @return \Illuminate\Http\Response
     */
    public function stream($question, $history = false)
    {
        $debug = false;
         
        ignore_user_abort(true);

        $question = 'Provide your response in a markdown code block '.$question;

        if (!$history) {
            $history = [
                ['role' => 'user', 'content' => $question]
            ];
        }

        //Cancel temp id
        $tempId = Str::random(15);
        Redis::set($tempId, true);

        if (ob_get_level() == 0) ob_start();
        $answer = '';

        if ($debug) {
            $stream = [
                'h','e','l','l','o',' ','h','o','w',' ','a','re',' you','h','e','l','l','o',' ','h','o','w',' ','a','re',' you','h','e','l','l','o',' ','h','o','w',' ','a','re',' you','h','e','l','l','o',' ','h','o','w',' ','a','re',' you','h','e','l','l','o',' ','h','o','w',' ','a','re',' you'
            ];
        } else {
            $token = TokenController::getToken();
            
            $client = OpenAI::factory()
            ->withApiKey($token)
            ->withHttpClient(new \GuzzleHttp\Client(['verify'=>true,'proxy'=>'http://R3DX7x:L09c5U@186.65.114.226:9051']))
            ->make();
            
            $error = false;

            try {
                $stream = $client->chat()->createStreamed([
                    'model' => 'gpt-3.5-turbo',
                    'messages' => $history,
                    'max_tokens' => 1024,
                ]);
            } catch (\OpenAI\Exceptions\ErrorException $e) {
                $error = true;

                $errorCode = @$e->getErrorCode();

                if (!$errorCode) {
                    $errorCode = $e->getErrorType();
                }
            } catch (\OpenAI\Exceptions\TransporterException $e) {
                $error = true;

                $errorCode = $e->getCode();
            }

            if ($error) {
                $text = "В данный момент невозможно обработать запрос. Ошибка: {$errorCode}";
    
                $json = json_encode(['message' => $text, 'error' => true]);
    
                echo 'data: ' . $json;
                echo "\n\n";
                ob_flush();
                flush();
    
                $answer .= $text;

                ob_end_flush();
    
                return ['error' => true, 'error_code' => $errorCode, 'answer' => $answer];
            }
        }

        echo 'data: {"tempId":"' . $tempId . '"}';
        echo "\n\n";
        ob_flush();
        flush();

        foreach ($stream as $response) {

            if ($debug) {
                $text = $response;
                usleep(50000);
            } else {
                $text = $response->choices[0]->delta->content;
            }

            if (connection_aborted() || !Redis::get($tempId)) {
                break;
            }

            $answer .= $text;

            $json = json_encode(['message' => $text]);

            echo 'data: ' . $json;
            echo "\n\n";
            ob_flush();
            flush();
        }

        ob_end_flush();

        return ['error' => false, 'answer' => $answer];
    }
}
