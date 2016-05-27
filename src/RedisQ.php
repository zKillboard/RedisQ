<?php

namespace RedisQ;

class RedisQ
{
    public function queueObject($object)
    {
        global $redis;

        $wrapped = serialize($object);

        $allQueues = new RedisTtlSortedSet('redisQ:allQueues');
        $queues = $allQueues->getMembers();

        $multi = $redis->multi();

        // Store an instance of the object
        $objectID = 'redisQ:objectID:'.uniqID().md5($wrapped);
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

    public function listen($queueID)
    {
        global $redis;

        $rQueueID = "redisQ:queueID:$queueID";

        self::registerListener($rQueueID);

        $pop = $redis->blPop($rQueueID, 10);
        if (!isset($pop[1])) {
            return;
        }

        $objectID = $pop[1];
        $object = $redis->get($objectID);

        return unserialize($object);
    }
}
