<?php

require_once "config.php";

// redisq class autoloader
spl_autoload_register('redisqautoload');

function redisqautoload($className)
{
    $className = str_replace("RedisQ\\", "", $className);
    $baseDir = dirname(__FILE__);
    $fileName = "$baseDir/src/$className.php";
    if (file_exists($fileName)) {
        require_once $fileName;
    }
}

$redis = new Redis();
$redis->pconnect($redisServer, $redisPort);
