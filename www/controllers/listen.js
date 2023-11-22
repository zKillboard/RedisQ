'use strict';

module.exports = {
	paths: '/listen.php',
	get: get,
}

async function get(req, res, app) {
	try {
		/*const ip =
	    req.headers['http_cf_connecting_ip'] ||
	    req.headers['http_x_forwarded_for'] ||
	    req.headers['remote_addr'] ||
	    req.headers['real_ip_header'] ||
	    req.headers['real-ip-header'] ||
	    req.headers['CF-Connecting-IP'] ||
	    req.headers['x-forwarded-for'] ||
	    req.socket.remoteAddress;*/

		const queueID = req.query.queueID; 
		const ttw = Math.min(10, Math.max(1, parseInt(req.query.ttw || 10)));

		if (queueID === undefined) {
			const start = Date.now();
			do { await app.sleep(1000); } while ((Date.now() - start) < 10000000);
			return {status_code: 400};
		}

		await app.redis.setex('redisQ:queue:' + queueID, 9600, ".");
		let sackID, t = 0;
		do {
			sackID = await app.redis.rpop('redisQ:list:' + queueID);
			if (sackID == null) {
				const start = Date.now();
				do { await app.sleep(100); } while ((Date.now() - start) < 1000);
				t = t + 1; 
			}
		} while (sackID == null && t <= 10);
		const sack = sackID == null ? null : JSON.parse(await app.redis.get(sackID));

		return {json: {package: sack}};
	} catch (e) {
		console.error(e);
		return {status_code: 503};
	}
}
