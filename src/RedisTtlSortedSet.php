<?php

namespace RedisQ;

class RedisTtlSortedSet
{
    private $queueName;
    private $ttl = 9600;

    public function __construct($queueName, $ttl = 9600)
    {
        $this->queueName = $queueName;
        $this->ttl = $ttl;
    }

    public function add($time, $value)
    {
        global $redis;

        if ($time < (time() - $this->ttl)) {
            return;
        }

        $redis->zAdd($this->queueName, $time, $value);
    }

    public function cleanup()
    {
        global $redis;

        $redis->zRemRangeByScore($this->queueName, 0, (time() - $this->ttl));
    }

    public function count()
    {
        global $redis;

        $this->cleanup();

        return $redis->zCard($this->queueName);
    }

    public function getMembers()
    {
        global $redis;

        $count = self::count();

        return $redis->zRange($this->queueName, 0, $count);
    }
}
