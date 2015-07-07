<?php

require_once "../init.php";

// First, register as a listener
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$server/listen.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "queueID=TestQ");
$response = curl_exec($ch);

echo "Initial listen may return a null package\n";
print_r(json_decode($response,true));
echo "\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$server/queue.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, 1);
$auth = $queueAuth[0];
$user = (string) key($auth);
$pass = $auth[$user];
curl_setopt($ch, CURLOPT_POSTFIELDS, "user=$user&pass=$pass&package=1234");
echo "Queueing 1234 as a package...\n";
$response = curl_exec($ch);
echo "Package queued...\n";
print_r(json_decode($response,true));

echo "Now listen for the package we just queued\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$server/listen.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "queueID=TestQ");
$response = curl_exec($ch);
print_r(json_decode($response,true));
echo "Success!\n";
