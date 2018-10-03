<?php

namespace RedisQ;

class RedisQ
{
    public function queueObject($object)
    {
        global $redis;

        $wrapped = serialize($object);

        $allQueues = new RedisTtlSortedSet('redisQ:allQueues');
        $objectQueues = new RedisTtlSortedSet('objectQueues');
        $queues = $allQueues->getMembers();

        $multi = $redis->multi();

        // Store an instance of the object
        $objectID = 'redisQ:objectID:'.uniqID().md5($wrapped);
        $objectQueues->add(time(), $objectID);
        $multi->setex($objectID, 9600, $wrapped);

        // Add objectID to all queues
        foreach ($queues as $queueID) {
            $multi->lPush($queueID, $objectID);
            $multi->expire($queueID, 9600);
        }
        $multi->exec();
    }

    public function registerListener($queueID)
    {
        $allQueues = new RedisTtlSortedSet('redisQ:allQueues');
        $allQueues->add(time(), $queueID);
    }

    public function listen($queueID, $timeToWait = 10, $filterValue = null)
    {
        global $redis;

        $timeToWait = max(1, min(10, $timeToWait));

        $rQueueID = "redisQ:queueID:$queueID";
        $wQueueID = "$rQueueID:w";
        if ($redis->set($wQueueID, true, Array('nx', 'ex'=>15)) === false) {
            header('HTTP/1.1 429 Too many requests.');
            exit();
        }

        self::registerListener($rQueueID);

        try {
            $time = time();
            do {
                $object = false;
                $pop = $redis->blPop($rQueueID, 1);
                if (!isset($pop[1])) {
                    if (time() >= ($time + $timeToWait)) return;
                } else {
                    $objectID = $pop[1];
                    $object = $redis->get($objectID);
                    $object = unserialize($object);
                    $object = self::matchesFilter($filterValue, $object);
                }
            } while ($object === false);
        } finally {
            $redis->del($wQueueID);
        }

        return $object;
    }

    protected function matchesFilter($filterValue, $object)
    {
        if ($filterValue == null) return $object;
        return self::recursive_array_search($filterValue, unserialize($object)) ? $object : false;
    }

    protected function recursive_array_search($needle, $haystack) {
        foreach($haystack as $key=>$value) {
            $current_key = $key;
            if ($needle === $value || (is_array($value) && self::recursive_array_search($needle, $value) !== false)) {
                return true;
            } else if ($needle === $value) {
                return true;
            }
        }
        return false;
    }
}
