<?php

require_once '../init.php';

use RedisQ\RedisQ;

while (true) {
    $r = RedisQ::listen('foobar123');
    print_r($r);
    echo "\n";
}
