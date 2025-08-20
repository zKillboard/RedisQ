'use strict';

module.exports = {
    paths: '/object.php',
    get: get
}

async function get(req, res, app) {
    const objectID = (req.query.objectID || '').trim();
    if (objectID.length == 0) return {status_code: 404};
    try {
        const object = await app.redis.get(`redisQ:object:${objectID}`);
        if (object == null) {
            return { status_code: 404 };
        }

        let o = JSON.parse( object );
        return { json: { package: o }, 'cors': '*' };
    } catch (e) {
        console.error(e);
        return {status_code: 503};
    }
}
