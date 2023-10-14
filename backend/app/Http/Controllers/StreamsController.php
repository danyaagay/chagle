<?php

namespace App\Http\Controllers;

use OpenAI;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class StreamsController extends Controller
{
    /**
     * The stream source.
     *
     * @return \Illuminate\Http\Response
     */
    public function stream($question)
    {
        ignore_user_abort(true);

        $tempId = Str::random(15);
        Redis::set($tempId, true);

        $answer = '';

        $stream = [
            'h',
            'e',
            'l',
            'l',
            'o',
            ' ',
            'h',
            'o',
            'w',
            ' ',
            'a',
            're',
            ' you',
            'h',
            'e',
            'l',
            'l',
            'o',
            ' ',
            'h',
            'o',
            'w',
            ' ',
            'a',
            're',
            ' you',
            'h',
            'e',
            'l',
            'l',
            'o',
            ' ',
            'h',
            'o',
            'w',
            ' ',
            'a',
            're',
            ' you',
            'h',
            'e',
            'l',
            'l',
            'o',
            ' ',
            'h',
            'o',
            'w',
            ' ',
            'a',
            're',
            ' you',            
            'h',
            'e',
            'l',
            'l',
            'o',
            ' ',
            'h',
            'o',
            'w',
            ' ',
            'a',
            're',
            ' you'
        ];

        //$client = OpenAI::client('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');
        //$stream = $client->chat()->createStreamed([
        //    'model' => 'gpt-3.5-turbo',
        //    'messages' => [
        //        ['role' => 'user', 'content' => $question]
        //    ],
        //    'max_tokens' => 1024,
        //]);

        //while (ob_get_level()){
        //    ob_get_contents();
        //    ob_end_clean();
        //}

        if (ob_get_level() == 0) ob_start();

        echo 'data: {"tempId":"' . $tempId . '"}';
        echo "\n\n";
        ob_flush();
        flush();

        foreach ($stream as $response) {
            //$text = $response->choices[0]->delta->content;
            if (connection_aborted() || !Redis::get($tempId)) {
                break;
            }

            $answer .= $response;

            usleep(50000);

            echo 'data: {"message":"' . $response . '"}';
            echo "\n\n";
            ob_flush();
            flush();
        }

        ob_end_flush();

        return $answer;
    }
}
