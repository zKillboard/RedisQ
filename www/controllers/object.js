'use strict';

module.exports = {
	paths: '/object.php',
	get: get
}

async function get(req, res, app) {
	try {
		const objectID = (req.query.objectID || '').trim();
		if (objectID.length == 0) return {json: {package: null}, 'cors': '*'};
		const object = await app.redis.get('redisQ:object:' + objectID);
		if (object == null) return {redirect: '/object.php?objectID=', 'cors': '*'};

		const sack = JSON.parse(object);
		return {json: {package: sack}, 'cors': '*'};
	} catch (e) {
		console.error(e);
		return {status_code: 503};
	}
}
