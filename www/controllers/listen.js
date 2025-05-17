'use strict';

module.exports = {
	paths: '/listen.php',
	get: get
}

async function get(req, res, app) {
	try {
		const queueID = (req.query.queueID || '').trim();
		const ttw = Math.min(10, Math.max(1, parseInt(req.query.ttw || 10)));

		if (queueID.length == 0) return {status_code: 404, 'cors': '*'};
		await app.redis.setex('redisQ:queue:' + queueID, 9600, ".");

		let sleeps = 0, ret = null;
        do {
            ret = await app.redis.rpop('redisQ:list:' + queueID);
            if (ret == null) await app.sleep(1000);
            sleeps++;
        } while (ret == null && sleeps < ttw);
		const sackID = ret;

		return {redirect: '/object.php?objectID=' + sackID, 'cors': '*'};
	} catch (e) {
		console.error(e);
		return {status_code: 503};
	}
}
