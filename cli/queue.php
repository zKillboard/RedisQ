<?php

require_once '../init.php';

for ($i = 0; $i <= 10; ++$i) {
    RedisQ\RedisQ::queueObject($i);
}
