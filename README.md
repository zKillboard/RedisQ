> [!IMPORTANT]
> # 🚨RedisQ Breaking Change
> Hey devs — usage of RedisQ has skyrocketed lately, and the data volume going out now far exceeds what websocket + RedisQ handled just a few months ago.
> To keep things efficient and sustainable, I’m planning to remove the embedded killmail data from RedisQ objects. Going forward, tools will need to fetch the killmail directly from the ESI API using the provided killmail/hash.
> I know this will break some (probably all) existing integrations, so consider this your heads-up to prepare for the change.
> More details (and timing) will follow once I finalize the rollout plan.  The proposed change will remove the killmail object and look like this:
```json
{
  "package": {
    "killID": 130678514,
    "zkb": {
      "locationID": 40030969,
      "hash": "145c457c34ce9c9e8d67e942e764d8f439b22271",
      "fittedValue": 3373417589.45,
      "droppedValue": 2474643537.39,
      "destroyedValue": 900440852.06,
      "totalValue": 3375084389.45,
      "points": 13,
      "npc": false,
      "solo": false,
      "awox": false,
      "labels": [
        "tz:ru",
        "cat:6",
        "#:5+",
        "pvp",
        "loc:nullsec",
        "isk:1b+"
      ],
      "href": "https://esi.evetech.net/v1/killmails/130678514/145c457c34ce9c9e8d67e942e764d8f439b22271/"
    }
  }
}
```

# RedisQ

A simple queue service using Redis as the backend. All you have to do is point your code to https://zkillredisq.stream/listen.php. Then parse the JSON that you receive and do anything you like with it.

If no killmail has come in for 10 seconds, you'll receive a null package, example:
{"package":null}

The server will remember your queueID for up to 3 hours, therefore, pauses in your code will not cause you to miss out on killmails.

##### Do I need Redis to use this service?

You don't need Redis to use this service, its only called RedisQ because the service itself is powered by Redis.

##### How do I identify myself?

RedisQ will use the parameter queueID to identify you. This field is required! Example:

    https://zkillredisq.stream/listen.php?queueID=Voltron9000

##### How can I wait less than 10 seconds if there isn't a new killmail?

By default, RedisQ will wait up to 10 seconds for a new killmail to come in. To wait less than this 10 seconds, you can use the ttw parameter, which is short for timeToWait. Example:

    https://zkillredisq.stream/listen.php?queueID=Voltron9000&ttw=1

And yes, you can combine the ttw and queueID parameters. The code will enforce a minimum of 1 and a maximum of 10 seconds.

##### Something changed with the way RedisQ works, help?

As of August, 2025, a change has been implemented such that the /listen.php endpoint redirects to /object.php with an objectID for your next package.  Be sure that whatever tool you are using can accommodate redirects.

    https://zkillredisq.stream/object.php?objectID=NotRealObjectID

#### Limitations

- You may have one (1) request being handled at a time per queueID. Additional requests being served while another request is already polling will resolve with http code 429.
- You may request at a limit of two (2) requests per second per IP address.  This limitations is enforced by CloudFlare – if you exceed this limitation your request will resolve with http code 429.

#### FAQ

###### So, this seems too easy. What do I have to do again?

It really is very, very simple. All you have to do is point something at https://zkillredisq.stream/listen.php, that can be curl, file_get_contents, wget, etc. etc. Here's an example of getting a killmail with PHP

  ```
  $raw = file_get_contents("https://zkillredisq.stream/listen.php?queueID=YourIdHere");
  $json = json_decode($raw, true);
  $killmail = $json['package'];
  ```
  
That's it, really. You now have a killmail. Put that into a loop and you can keep feeding yourself all the killmails as zKillboard gets them.

###### Can I have pauses between requests without missing any killmails?

Yes, RedisQ identifies you based on your queueID and will remember you for up to 3 hours. So you can setup cron jobs to run every minute, 5 minutes, 15 minutes, etc. and not worry about missing any of the killmails.

###### Can I use more than one connection on RedisQ?

(This sections is currently deprecated, perhaps only temporarily) 

Only one connection at a time is allowed. If you try for more the extra connections will receive a http 429 error. Too many 429 errors will cause your IP and userid (if provided) to be temporarily banned for several hours.

###### Can I subscribe to just my pilot's / character's / alliance's killmails?

Yes!  Use the filter parameter.  See the section below on RedisQ Filter Rules.

	https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=alliance_id=434243723

If you pass an invalid filter then a 400 Invalid Request error is thrown.

###### Seriously? Why do this and not use websockets or something like that?

Websockets are great, sure, but I wanted to write something that was damn easy to implement in any language. RedisQ isn't trying to be fancy like websockets, it is only trying to disemminate killmails in a quick and very simple fashion.

###### Why is it called RedisQ?

Because I used Redis to implement what I was trying to do, it's a queue type service, and so I went with the completely unoriginal name RedisQ.

###### Why are you using .php extension when RedisQ isn't using PHP?

The initial version of RedisQ utilized PHP as the backend language of choice.  However, a subsequent rewrite is now using NodeJS.  To keep things simple and allow for great backwards compatibility the endpoints kept their .php extension.

###### I thought the URL was redisq.zkillboard.com?

The URL was changed in May, 2025 to zkillredisq.stream.

###### How do I say RedisQ?

Everyone says it different, but I say it like red-is-q.  You can say it however you want though.

# RedisQ Filter Rules

## 1. Operators
- `=` : equals  
- `!=` : not equals  
- `<` : less than  
- `<=` : less than or equal  
- `>` : greater than  
- `>=` : greater than or equal  

## 2. Chaining Rules
- **AND** (`;`): all conditions must match  
  - Example:  
    ```
    alliance_id=1234;damage_done>=500
    ```
    → Matches only if both conditions are true.  

- **OR** (`,`): at least one condition must match  
  - Example:  
    ```
    alliance_id=1234,4321,5678
    ```
    → Matches if any of the listed conditions are true.  

- **Important:** You cannot mix `;` and `,` in the same filter string.  

## 3. Matching Behavior
- Works on **any key** inside the RedisQ `package` object (deeply nested).  
- If a key’s value is an **array**, all elements of the array are searched.  
- Values are compared as **numbers** if both sides are numeric, otherwise as strings.  

## 4. Examples
- `https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=character_id=5678`  
  → true if any `character_id` equals 5678  

- `https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=damage_done>=1000`  
  → true if any `damage_done` is ≥ 1000  

- `https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=alliance_id!=9999`  
  → true if no matching `alliance_id` equals 9999  

- `https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=alliance_id=1234;damage_done>500`  
  → both must match (AND)  

- `https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=character_id=1111,character_id=2222`  
  → matches if either character ID is found  

- `https://zkillredisq.stream/listen.php?queueID=Voltron9000&filter=labels=marked`  
  → matches if any key `labels`, which could be a key or an array, equals or contains the value marked
