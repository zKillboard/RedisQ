<?php

require_once '../init.php';

$queueID = @$_POST['queueID'];
if ($queueID === null) {
    $queueID = RedisQ\IP::get();
}

$package = RedisQ\RedisQ::listen($queueID);

$response = ['package' => $package];
echo json_encode($response);
