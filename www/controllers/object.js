'use strict';

module.exports = {
    paths: '/object.php',
    get: get
}

const default_ttl = parseInt(process.env.default_ttl || 10800);

async function get(req, res, app) {
    const objectID = (req.query.objectID || '').trim();
    if (objectID.length == 0) return {status_code: 404};
    if (objectID == 'null')  return { json: { package: null }, 'cors': '*' };

    try {
        const object = await app.redis.get(`redisQ:object:${objectID}`);
        if (object == null) {
            return { status_code: 404 };
        }

        let o = JSON.parse( object );
        return { json: { package: o }, ttl: default_ttl, 'cors': '*' };
    } catch (e) {
        console.error(e);
        return {status_code: 503};
    }
}

