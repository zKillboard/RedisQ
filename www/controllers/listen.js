'use strict';

const { parseFilters, matchesFilter } = require('../../util/filters.js');

module.exports = {
	paths: '/listen.php',
	get: get
}

const null_redirect = `/object.php?objectID=null`;
const default_ttl = parseInt(process.env.default_ttl || 10800);
const msPerDay = 24 * 60 * 60 * 1000;

let shutdownProbability = 0;
let daysUntilMay31 = 0;

function updateShutdownProbability() {
	const now = new Date();
	const may31 = new Date(now.getFullYear(), 4, 31);
	daysUntilMay31 = Math.ceil((may31 - now) / msPerDay);
	shutdownProbability = Math.max(0, Math.min(100, 100 - daysUntilMay31));
}

updateShutdownProbability();
setInterval(updateShutdownProbability, 60 * 1000).unref();

async function get(req, res, app) {
	const queueID = (req.query.queueID || '').trim();
	if (queueID.length == 0) return { status_code: 429 };

	const lockKey = `redisQ:lock:${queueID}`;
	let lockAcquired = false;
	try {
		lockAcquired = await app.redis.set(lockKey, "1", "NX", "EX", 30);
		if (lockAcquired !== 'OK') {
			return { status_code: 429 };
		}
		lockAcquired = true;

		const ttw = Math.min(10, Math.max(1, parseInt(req.query.ttw || 10)));
		const ttl = Math.max(1, Math.min(default_ttl, parseInt(req.query.ttl || default_ttl)));

		if ((Math.random() * 100) < shutdownProbability) {
			console.log('denied!');
			await app.sleep(3000);
			return {
				status_code: 403,
				json: {
					access: 'denied!',
					remaining: daysUntilMay31 + ' days until May 31, 2026',
					chance: shutdownProbability.toFixed(2) + '%',
					message: 'redisq is shutting down May 31, 2026! use R2Z2 instead https://github.com/zKillboard/zKillboard/wiki/API-(R2Z2)'
				}
			};
		}

		let filter = null;
		try {
			filter = parseFilters(req.query.filter);
		} catch (err) {
			return { status_code: 400 };
		}
		let sackID, t = 0, object;

		await app.redis.setex('redisQ:queue:' + queueID, ttl, ".");
		do {
			sackID = await app.redis.rpop('redisQ:list:' + queueID);
			if (sackID) {
				let raw = await app.redis.get(sackID);
				if (raw) {
					object = JSON.parse(raw);
					if (!matchesFilter(object, filter)) {
						sackID = null;
						continue;
					}
				} else {
					sackID = null;
					continue;
				}
			} else {
				await app.sleep(1000);
				t = t + 1;
			}
		} while (sackID == null && t <= ttw);
		if (sackID != null) {
			if (req.query.esi && object && object.package && object.package.zkb) {
				return { status_code: 302, 'cors': '*', redirect: redirect };
			}
			const split = sackID.split(':');
			const objectID = split[2];
			const redirect = `/object.php?objectID=${objectID}`;
			await app.sleep(Math.floor(Math.random() * 1000) + 500);
			return { status_code: 302, 'cors': '*', redirect: redirect };
		}
		return { status_code: 302, 'cors': '*', redirect: null_redirect };
	} catch (e) {
		console.error(e);
		return { status_code: 503 };
	} finally {
		try {
			if (lockAcquired) await app.redis.del(lockKey);
		} catch (ee) {
			// we've got problems here... 
			process.kill(process.pid, 'SIGINT');
		}
	}
}
