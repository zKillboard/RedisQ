<?php

namespace RedisQ;

class Action
{
    private static $ch = null;

    public static function listen($server)
    {
        $json = self::doPost("$server/listen.php", '');

        return unserialize($json['package']);
    }

    public static function queue($server, $user, $pass, $package)
    {
        return self::doPost("$server/queue.php", "user=$user&pass=$pass&package=".urlencode(serialize($package)));
    }

    private static function doPost($url, $fields)
    {
	if (self::$ch === null) {
		self::$ch = curl_init();
        }
        curl_setopt(self::$ch, CURLOPT_URL, $url);
        curl_setopt(self::$ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt(self::$ch, CURLOPT_POST, 1);
        curl_setopt(self::$ch, CURLOPT_POSTFIELDS, $fields);
	return json_decode(curl_exec(self::$ch), true);
    }
}
