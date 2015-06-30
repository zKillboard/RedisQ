<?php

require_once '../init.php';

header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method not allowed');
    echo "['error':'Method not allowed, only use POST']";
    exit();
}

$authUser = $_POST['user'];
$authPass = $_POST['pass'];
$package = $_POST['package'];

RedisQ\RedisQ::queueObject($package);
