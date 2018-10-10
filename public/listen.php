<?php

require_once '../init.php';

$queueID = @$_POST['queueID'];
if ($queueID === null) {
    $queueID = @$_GET['queueID'];
}
$ip = RedisQ\IP::get();
if ($queueID === null) {
    $queueID = $ip;
}

$ttw = (int) @$_GET['ttw'];
if ($ttw == 0) $ttw = 10;
if ($ttw < 0 || $ttw > 10) $ttw = 10;

$filterValue = @$_GET['filterValue'];
$filterValue = $filterValue != null ? (int) $filterValue : null;

$package = unserialize(RedisQ\RedisQ::listen($queueID, $ip, $ttw, $filterValue));
if ($package === false) $package = null;

$response = ['package' => $package];
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');
echo json_encode($response, JSON_UNESCAPED_SLASHES);
