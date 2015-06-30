<?php

require_once '../init.php';

$keys = $redis->keys('redisQ*');

foreach ($keys as $key) {
    $redis->del($key);
}
