<?php

require_once '../init.php';

RedisQ\Action::queue(['package' => ['foo' => 'bar', 'abc' => 'def']]);
