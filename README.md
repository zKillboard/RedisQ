[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/zKillboard/RedisQ/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/zKillboard/RedisQ/?branch=master)

# RedisQ

A simple queue service using Redis as the backend. All you have to do is point your code to http://redisq.zkillboard.com/listen.php. Then parse the JSON that you receive and do anything you like with it.

If no killmail has come in for 10 seconds, you'll receive a null package, example:
{"package":null}

The server will remember the calling IP for up to 3 hours, therefore, pauses in your code will not cause you to miss out on killmails.

Please Note: You don't need Redis to use this service, its only called RedisQ because the service itself is powered by Redis.
