'use strict';

module.exports = {
   paths: '/queue.php',
   post: post,
}

async function post(req, res, app) {
    try {
        const pass = req.query.pass;
        const sack = req.body || null; // can't use the word package, so we'll use sack!

        if (process.env.pass !== pass) return {status_code: 401};
        if (sack === null) return {status_code: 400};

        const objectID = 'redisQ:object:' + Date.now();
        const multi = await app.redis.multi()
        await multi.setex(objectID, 9600, JSON.stringify(sack));
        for (let queueID of await app.redis.keys('redisQ:queue:*')) await multi.lpush('redisQ:list:' + queueID.replace('redisQ:queue:', ''), objectID);
        await multi.exec();

        return {json: {success: true}}
    } catch (e) {
        console.log(e);
        await app.sleep(1000);
        return {staus_code: 503};
    }
}