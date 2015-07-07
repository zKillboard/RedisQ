<?php

namespace RedisQ;

class Action
{
    public static function listen()
    {
        global $redisQServer;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "$redisQServer/listen.php");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'listen=true');
        $response = curl_exec($ch);
        $json = json_decode($response, true);

        return unserialize($json['package']);
    }

    public static function queue($package)
    {
        global $queueAuth, $redisQServer;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "$redisQServer/queue.php");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, 1);
        $auth = $queueAuth[0];
        $user = (string) key($auth);
        $pass = $auth[$user];
        curl_setopt($ch, CURLOPT_POSTFIELDS, "user=$user&pass=$pass&package=".urlencode(serialize($package)));
        $response = curl_exec($ch);

        return json_decode($response, true);
    }
}
