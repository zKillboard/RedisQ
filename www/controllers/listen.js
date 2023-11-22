'use strict';

module.exports = {
   paths: '/listen.php',
   get: get,
}

async function get(req, res, app) {
    try {
        const ip = 
            req.headers['http_cf_connecting_ip'] ||
            req.headers['http_x_forwarded_for'] ||
            req.headers['remote_addr'] ||
            req.headers['x-forwarded-for'] || 
            req.socket.remoteAddress;

        const queueID = req.query.queueID || ip;
        const ttw = Math.min(10, Math.max(1, req.query.ttw || 10));

        await app.redis.setex('redisQ:queue:' + queueID, 9600, ".");
        const sackID = await app.redis.brpop('redisQ:list:' + queueID, ttw);
        const sack = sackID == null ? null : await app.redis.get(sackID[1]);
        console.log(sack);

        return {json: {package: JSON.parse(sack)}};
    } catch (e) {
        console.log(e);
        await app.sleep(1000);
        return {status_code: 503};
    }
}