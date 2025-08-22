'use strict';

module.exports = {
    paths: '/',
    get: get
}

let ocount = -1, lcount = -1;

async function get(req, res, app) {
    try {
        if (ocount == -1) {
            const objects = await app.redis.keys('redisQ:object:*');
            const listeners = await app.redis.keys('redisQ:list:*');
            ocount = objects.length;
            lcount = listeners.length;
            setTimeout(() => { ocount = -1; lcount = -1 }, 60000);
        }

        return { json: { listeners: lcount , objects: ocount }, cors: '*' };
    } catch (e) {
        console.error(e);
        return {status_code: 503};
    }
}
