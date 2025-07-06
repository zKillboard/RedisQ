'use strict';

module.exports = {
    paths: '/listen.php',
    get: get
}

async function get(req, res, app) {
    try {
        const queueID = (req.query.queueID || '').trim();
        const ttw = parseFloat(Math.min(10, Math.max(1, parseInt(req.query.ttw || 10))));
        let sackID, t = 0;

        if (queueID.length > 0) {
            await app.redis.setex('redisQ:queue:' + queueID, 9600, ".");
        }
		
		sackID = await app.redis.brpop('redisQ:list:' + queueID, ttw);

        if (sackID !== null) return {redirect: `/packages/${sackID[1]}.json`};
        else return {redirect: `/null.json`};


		const raw = await app.redis.get(sackID[1]);
        const sack = JSON.parse(raw);

        if (queueID.length == 0) return {status_code: 400};
        return {json: {package: sack}, 'cors': '*'};
    } catch (e) {
        console.error(e);
        return {status_code: 503};
    }
}