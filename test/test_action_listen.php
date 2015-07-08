<?php

require_once '../init.php';

do {
    $foo = RedisQ\Action::listen('redisq.zkillboard.com');
    echo $foo['killID']."\n";
} while ($foo != null);
