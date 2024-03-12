<?php

namespace App\Services;

class StreamService
{
    public function sendMessage($json)
    {
        $json = json_encode($json);

        echo 'data: ' . $json . "\n\n";
        flush();
    }
}
