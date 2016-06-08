<?php

namespace RedisQ;

require_once "../init.php";

$allQueues = new RedisTtlSortedSet('redisQ:allQueues');
$objectQueues = new RedisTtlSortedSet('objectQueues');
$listeners = number_format($allQueues->count(), 0);
$objects = number_format($objectQueues->count(), 0);

header("Content-type: text/text");
echo "$listeners Listeners\n";
echo "$objects Objects\n";
