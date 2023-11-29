'use strict';

module.exports = {
	paths: '/listen.php',
	get: get
}

async function get(req, res, app) {
	try {
		const queueID = req.query.queueID || ''; 
		const ttw = Math.min(10, Math.max(1, parseInt(req.query.ttw || 10)));
		let sackID, t = 0;

        if (queueID.length > 0) {
		    await app.redis.setex('redisQ:queue:' + queueID, 9600, ".");
        }
		do {
			sackID = await app.redis.rpop('redisQ:list:' + queueID);
			if (sackID == null) {
				const start = Date.now();
				do { await app.sleep(100); } while ((Date.now() - start) < 1000);
				t = t + 1; 
			}
		} while (sackID == null && t <= ttw);
		const sack = sackID == null ? null : JSON.parse(await app.redis.get(sackID));

        if (queueID.length == 0) return {status_code: 400};
		return {json: {package: sack}, 'cors': '*'};
	} catch (e) {
		console.error(e);
		return {status_code: 503};
	}
}
