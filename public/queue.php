<?php

require_once '../init.php';

header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method not allowed');
    echo '{"error":"Method not allowed, only use POST"}';
    exit();
}

$authUser = @$_POST['user'];
$authPass = @$_POST['pass'];
$package = @$_POST['package'];

$authed = false;
foreach ($queueAuth as $auth) {
	$user = (string) key($auth);
	$pass = $auth[$user];
	if ($authUser == $user && $authPass == $pass) $authed |= true;
	if ($authed) break;
}

if ($authed === false) {
    header('HTTP/1.1 401 Unauthorized');
    echo '{"error":"Unauthorized"}';
    exit();
}

if ($package == null) {
    header('HTTP/1.1 400 Bad Data');
    echo '{"error":"Bad Data: package was empty"}';
    exit();
}

RedisQ\RedisQ::queueObject($package);
echo '{"success":true}';
