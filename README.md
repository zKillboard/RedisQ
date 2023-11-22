[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/zKillboard/RedisQ/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/zKillboard/RedisQ/?branch=master)

# RedisQ

A simple queue service using Redis as the backend. All you have to do is point your code to https://redisq.zkillboard.com/listen.php. Then parse the JSON that you receive and do anything you like with it.

If no killmail has come in for 10 seconds, you'll receive a null package, example:
{"package":null}

The server will remember your queueID for up to 3 hours, therefore, pauses in your code will not cause you to miss out on killmails.

##### Do I need Redis to use this service?

You don't need Redis to use this service, its only called RedisQ because the service itself is powered by Redis.

##### How do I identify myself?

RedisQ will use the parameter queueID to identify you. This field is required! Example:

    https://redisq.zkillboard.com/listen.php?queueID=Voltron9000

##### How can I wait less than 10 seconds if there isn't a new killmail?

By default, RedisQ will wait up to 10 seconds for a new killmail to come in. To wait less than this 10 seconds, you can use the ttw parameter, which is short for timeToWait. Example:

    https://redisq.zkillboard.com/listen.php?ttw=1

And yes, you can combine the ttw and queueID parameters. The code will enforce a minimum of 1 and a maximum of 10 seconds.

#### FAQ

###### So, this seems too easy. What do I have to do again?

It really is very, very simple. All you have to do is point something at https://redisq.zkillboard.com/listen.php, that can be curl, file_get_contents, wget, etc. etc. Here's an example of getting a killmail with PHP

  ```
  $raw = file_get_contents("https://redisq.zkillboard.com/listen.php?queueID=YourIdHere");
  $json = json_decode($raw, true);
  $killmail = $json['package'];
  ```
  
That's it, really. You now have a killmail. Put that into a loop and you can keep feeding yourself all the killmails as zKillboard gets them.

###### Can I have pauses between requests without missing any killmails?

Yes, RedisQ identifies you based on your queueID and will remember you for up to 3 hours. So you can setup cron jobs to run every minute, 5 minutes, 15 minutes, etc. and not worry about missing any of the killmails.

###### Is there a rate limit on RedisQ?

No, there isn't a rate limit. By nature, if there isn't a killmail to give to you, RedisQ will make you wait up to 10 seconds before returning a null package to you. If there is a large amount of killmails to give to you, feel free to hit RedisQ as fast as you like and it'll return the killmails to you as quickly as you can retrieve them.

###### Can I use more than one connection on RedisQ?

(This sections is currently deprecated, perhaps only temporarily) 

Only one connection at a time is allowed. If you try for more the extra connections will receive a http 429 error. Too many 429 errors will cause your IP and userid (if provided) to be temporarily banned for several hours.

###### Can I subscribe to just my pilot's / character's / alliance's killmails?

Not at this time. I went with stupidly simple simplicity when I made this and didn't bother with any code for filters and/or subscriptions. You can easily write the code on your end to filter the killmails to your preferences.

###### Seriously? Why do this and not use websockets or something like that?

Websockets are great, sure, but I wanted to write something that was damn easy to implement in any language. RedisQ isn't trying to be fancy like websockets, it is only trying to disemminate killmails in a quick and very simple fashion.

If you really want to use websockets use zkill's websocket service. Documentation can be found here: https://github.com/zKillboard/zKillboard/wiki/Websocket

###### Why is it called RedisQ?

Because I used Redis to implement what I was trying to do, it's a queue type service, and so I went with the completely unoriginal name RedisQ.

###### Why are you using .php extension when RedisQ isn't using PHP?

The initial version of RedisQ utilized PHP as the backend language of choice.  However, a subsequent rewrite is now using NodeJS.  To keep things simple and allow for great backwards compatibility the endpoints kept their .php extension.
