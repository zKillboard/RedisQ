<?php

require_once '../init.php';

$queueID = @$_POST['queueID'];
if ($queueID === null) {
    $queueID = @$_GET['queueID'];
}
if ($queueID === null) {
    $queueID = RedisQ\IP::get();
}

$ttw = (int) @$_GET['ttw'];
if ($ttw == 0) $ttw = 10;

$package = unserialize(RedisQ\RedisQ::listen($queueID, $ttw));
if ($package === false) $package = null;

$response = ['package' => $package];
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');
echo json_encode($response, JSON_UNESCAPED_SLASHES);
