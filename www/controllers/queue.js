'use strict';

const fs = require('fs').promises;

module.exports = {
    paths: '/queue.php',
    post: post,
}

const default_ttl = parseInt(process.env.default_ttl || 10800);

async function post(req, res, app) {
    try {
        const pass = req.body.pass;
        const sack = decodeURI(req.body.package); // can't use the word package, so we'll use sack!

        if (process.env.pass !== pass) return {status_code: 401};
        if (sack === null) return {status_code: 400};

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const objectID = 'redisQ:object:' + id;

        const multi = await app.redis.multi();
        await multi.setex(objectID, default_ttl, sack);
        for (let queueID of await app.redis.keys('redisQ:queue:*')) {
            const listkey = 'redisQ:list:' + queueID.replace('redisQ:queue:', '');
            await multi.lpush(listkey, objectID);
            await multi.expire(listkey, default_ttl);
        }
        await multi.exec();

        return {json: {success: true}, 'cors': '*'}
    } catch (e) {
        console.log(e);
        await app.sleep(1000);
        return {staus_code: 503};
    }
}
