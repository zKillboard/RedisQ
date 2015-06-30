<?php

require_once '../init.php';

header('Content-Type: application/json');
if (@$_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method not allowed');
    echo "['error':'Method not allowed, only use POST']";
    exit();
}

$queueID = @$_POST['queueID'];
if ($queueID === null) {
    $queueID = RedisQ\IP::get();
}

$package = RedisQ\RedisQ::listen($queueID);

$response = ['package' => $package];
echo json_encode($response);
