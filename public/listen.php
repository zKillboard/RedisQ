<?php

require_once '../init.php';

$queueID = @$_POST['queueID'];
if ($queueID === null) {
    $queueID = RedisQ\IP::get();
}

$package = unserialize(RedisQ\RedisQ::listen($queueID));

$response = ['package' => $package];
header('Content-Type: application/json');
echo json_encode($response);
