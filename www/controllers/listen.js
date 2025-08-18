'use strict';

module.exports = {
    paths: '/listen.php',
    get: get
}

async function get(req, res, app) {
    const queueID = (req.query.queueID || '').trim();
    if (queueID.length == 0) return {status_code: 429};

    const lockKey = `redisQ:lock:${queueID}`;
    let lockAcquired = false;
    try {
        lockAcquired = await app.redis.set(lockKey, "1", "NX", "EX", 30);
        if (lockAcquired !== 'OK') {
            console.log(queueID, "429'ed"); 
            return {status_code: 429};
        }
        lockAcquired = true;

        const ttw = Math.min(10, Math.max(1, parseInt(req.query.ttw || 10)));
        let sackID, t = 0;

        await app.redis.setex('redisQ:queue:' + queueID, 10800, ".");
        do {
            let repeat = false;
            let count = 0;
            // really need to switch to ioredis here
            do {
                sackID = await app.redis.rpop('redisQ:list:' + queueID);
                count++;
            } while (sackID != null && await app.redis.get(sackID) == null && count < 25000);
            if (sackID == null) {
                await app.sleep(1000);
                t = t + 1; 
            }
        } while (sackID == null && t <= ttw);
        const sack = sackID == null ? null : JSON.parse(await app.redis.get(sackID));

        if (queueID.length == 0) return {status_code: 400};
        return {json: {package: sack}, 'cors': '*'};
    } catch (e) {
        console.error(e);
        return {status_code: 503};
    } finally {
        if (lockAcquired) await app.redis.del(lockKey);
    }
}
