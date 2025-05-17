'use strict';

module.exports = {
	paths: '/queue.php',
	post: post,
}

async function post(req, res, app) {
	try {
		const pass = req.body.pass;
		const sack = decodeURI(req.body.package); // can't use the word package, so we'll use sack!

		if (process.env.pass !== pass) return {status_code: 401};
		if (sack === null) return {status_code: 400};

        const now = Date.now();
		const objectID = 'redisQ:object:' + now;
		const multi = await app.redis.multi();
		await multi.setex(objectID, 9600, sack);
		for (let queueID of await app.redis.keys('redisQ:queue:*')) {
			const listkey = 'redisQ:list:' + queueID.replace('redisQ:queue:', '');
			await multi.lpush(listkey, now);
			await multi.expire(listkey, 9600);
		}
		await multi.exec();

		return {json: {success: true}}
	} catch (e) {
		console.log(e);
		await app.sleep(1000);
		return {staus_code: 503};
	}
}
